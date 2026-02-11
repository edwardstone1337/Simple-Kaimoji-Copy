# Changelog

## Unreleased

### Added
- Copyable category preview chips on explore group pages (chips are now `<button class="seo-chip kaomoji-button">` with copy behavior)
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
- Header + nav wrapped in `.site-header-group` with shared frosted background; dark mode applies blur to both group and nav wrapper
- Sub-nav collapse is animated (max-height/opacity) instead of instant hide; innerHTML cleared after transition to avoid jump
- Nav and sub-nav link pills use visible border (`--s-color-border-default`); sticky nav background opacity 0.85
- SEO link card hover/active shadow moved to `::after` so transition doesn’t affect layout
- Reduced-motion: sub-nav collapse and link-card ::after transitions disabled
- Site debranding
- DOCUMENTATION.md updated to match current implementation (JSON data, nav/sections, theme)
- `sitemap.xml` now includes home + generated explore URLs
- Homepage includes crawlable links to explore/group pages
- Documentation now includes explicit ship checklist and release guardrails
- Phase 2e visual shell polish:
  - `.category-section` converted to frosted-glass cards with animated conic gradient borders (`@property --gradient-angle` + `rotate-gradient`)
  - dark mode card borders now use neon gradient stops; reduced-motion disables border animation
  - `--p-radius-md` and `--p-radius-lg` increased for larger component radii
  - nav and sub-nav pills now use the display font token (`--p-font-display`)
  - eyebrow text size increased and group `h2` heading scale increased on desktop
  - Popular section now renders kaomoji inside a `.category-section` card, with eyebrow label `人気`
  - Japanese label fix: `sleeping` now maps to `眠り`

### Removed
- Breadcrumb nav on all explore pages (layout, `renderBreadcrumbs`, `.seo-breadcrumb` CSS, design-system example)
