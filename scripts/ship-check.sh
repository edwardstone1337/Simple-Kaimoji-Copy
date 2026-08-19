#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[ship-check] JS syntax"
for f in script.js components.js; do
  [ -f "$f" ] && node --check "$f"
done

echo "[ship-check] Data integrity"
node - <<'NODE'
const data = require("./kaomojis.json");
const groups = new Set(data.groups.map(g => g.id));
const cats = new Map(data.categories.map(c => [c.id, c]));
let fail = false;

for (const c of data.categories) {
  if (!groups.has(c.group)) {
    console.error(`  category "${c.id}" references unknown group "${c.group}"`);
    fail = true;
  }
}

const seen = new Set();
for (const k of data.kaomojis) {
  if (!k.char || typeof k.char !== "string") {
    console.error(`  kaomoji with missing or non-string char`);
    fail = true;
    continue;
  }
  if (seen.has(k.char)) {
    console.error(`  duplicate kaomoji: ${k.char}`);
    fail = true;
  }
  seen.add(k.char);
  if (!Array.isArray(k.categories) || k.categories.length === 0) {
    console.error(`  kaomoji has no categories: ${k.char}`);
    fail = true;
  }
  for (const c of k.categories || []) {
    if (!cats.has(c)) {
      console.error(`  kaomoji "${k.char}" references unknown category "${c}"`);
      fail = true;
    }
  }
}

const empty = data.categories.filter(
  c => !data.kaomojis.some(k => k.categories.includes(c.id))
);
for (const c of empty) {
  console.error(`  category "${c.id}" has no kaomoji`);
  fail = true;
}

console.log(
  `[ship-check] ${data.kaomojis.length} kaomoji, ` +
  `${data.categories.length} categories, ${data.groups.length} groups`
);
if (fail) process.exit(1);
NODE

echo "[ship-check] Em dash policy"
# grep, not rg — rg is not guaranteed to be installed and its absence used to
# make this check pass silently.
if grep -n "—" index.html script.js styles.css kaomojis.json 2>/dev/null; then
  echo "[ship-check] Em dashes found in shipping files. Use a regular hyphen."
  exit 1
fi

echo "[ship-check] PASS"
