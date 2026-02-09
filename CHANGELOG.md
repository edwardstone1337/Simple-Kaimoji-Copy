# Changelog

## Unreleased

### Added
- Google Analytics (gtag.js, id `G-JKEBQ0M6NQ`)
- Favicon (`/favicon.png`, 32×32)
- DOCUMENTATION.md — tech stack, structure, behavior, data model, styling
- Data-driven UI from `kaomojis.json` (groups, categories, kaomojis array)
- Dark/light theme toggle with `localStorage` and `prefers-color-scheme`
- Sticky nav + sub-nav with scroll-based active state and overflow fade
- Static SEO pages generated under `/explore/` (hub, group pages, category pages)
- `scripts/generate-seo-pages.js` to regenerate `/explore/` and `sitemap.xml`
- `seo-page.js` for shared interaction behavior on generated SEO pages
- `scripts/ship-check.sh` for repeatable pre-ship validation
- `README.md` and `CONTRIBUTING.md` for onboarding and maintenance workflow
- CI ship check workflow (`.github/workflows/ship-check.yml`) and PR checklist template

### Changed
- Site debranding
- DOCUMENTATION.md updated to match current implementation (JSON data, nav/sections, theme)
- `sitemap.xml` now includes home + generated explore URLs
- Homepage includes crawlable links to explore/group pages
- Documentation now includes explicit ship checklist and release guardrails
