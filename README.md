# kaomoji.click

Static, data-driven kaomoji site with one-click copy UX and SEO landing pages.

Latest UI shell update:
- category sections (including Popular) render as frosted-glass cards with animated conic gradient borders
- nav pills use the display font token for stronger hierarchy
- section eyebrow and heading typography scales were increased for readability

## Quick Start

```bash
cd /Users/edwardstone/Development/Simple-Kaimoji-Copy
python3 -m http.server 4173
```

Open: `http://localhost:4173`

## Core Files

- `index.html`: main single-page product experience
- `script.js`: main app rendering and interactions
- `styles.css`: shared design tokens + component styles
- `kaomojis.json`: content source of truth
- `scripts/generate-seo-pages.js`: generates `/explore/` pages + `sitemap.xml`
- `seo-page.js`: interactions for generated SEO pages

## Regenerate SEO Pages

```bash
node scripts/generate-seo-pages.js
```

## Ship Gate

Run before opening a PR or shipping:

```bash
./scripts/ship-check.sh
```

This validates:
- JS syntax
- generated `/explore/` output and `sitemap.xml` consistency
- no em dashes in shipping copy files
- generated artifacts are committed

## More Docs

- `DOCUMENTATION.md`: architecture and behavior details
- `CONTRIBUTING.md`: workflow, definition of done, and release checklist
