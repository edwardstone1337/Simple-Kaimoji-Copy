#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[ship-check] Syntax checks"
node --check components.js
node --check script.js
node --check seo-page.js
node --check scripts/generate-seo-pages.js

echo "[ship-check] Regenerating SEO pages + sitemap"
node scripts/generate-seo-pages.js

echo "[ship-check] Validating generated page count and sitemap entries"
node <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("kaomojis.json", "utf8"));
const expectedGeneratedPages = 1 + (data.groups?.length || 0) + (data.categories?.length || 0);
const expectedSitemapUrls = 1 + expectedGeneratedPages; // home + explore pages

const exploreIndexPages = (() => {
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let out = [];
    for (const entry of entries) {
      const full = dir + "/" + entry.name;
      if (entry.isDirectory()) out = out.concat(walk(full));
      if (entry.isFile() && entry.name === "index.html") out.push(full);
    }
    return out;
  }
  return walk("explore");
})();

if (exploreIndexPages.length !== expectedGeneratedPages) {
  console.error(
    "[ship-check] Expected",
    expectedGeneratedPages,
    "generated index pages but found",
    exploreIndexPages.length
  );
  process.exit(1);
}

const sitemapXml = fs.readFileSync("sitemap.xml", "utf8");
const sitemapUrlCount = (sitemapXml.match(/<url>/g) || []).length;
if (sitemapUrlCount !== expectedSitemapUrls) {
  console.error(
    "[ship-check] Expected",
    expectedSitemapUrls,
    "sitemap URL entries but found",
    sitemapUrlCount
  );
  process.exit(1);
}

console.log("[ship-check] Generated pages:", exploreIndexPages.length);
console.log("[ship-check] Sitemap URL entries:", sitemapUrlCount);
NODE

echo "[ship-check] Enforcing em dash policy"
if rg -n "—" index.html script.js styles.css kaomojis.json seo-page.js explore >/dev/null; then
  echo "[ship-check] Found em dash characters in shipping files."
  rg -n "—" index.html script.js styles.css kaomojis.json seo-page.js explore
  exit 1
fi

echo "[ship-check] Ensuring regenerated artifacts are committed"
if ! git diff --quiet -- explore sitemap.xml; then
  echo "[ship-check] Generated artifacts changed. Commit updated /explore and /sitemap.xml before shipping."
  git diff --stat -- explore sitemap.xml
  exit 1
fi

if [[ "${SHIP_CHECK_VISUAL:-0}" == "1" ]]; then
  echo "[ship-check] Running visual snapshot check"
  bash scripts/visual-check.sh
else
  echo "[ship-check] Skipping visual snapshot check (set SHIP_CHECK_VISUAL=1 to enable)"
fi

echo "[ship-check] PASS"
