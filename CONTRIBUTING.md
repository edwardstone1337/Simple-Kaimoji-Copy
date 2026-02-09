# Contributing

## Workflow

1. Make changes in small, reviewable commits.
2. If `kaomojis.json` changes, regenerate SEO pages:
   - `node scripts/generate-seo-pages.js`
3. Run ship checks:
   - `./scripts/ship-check.sh`
4. Update docs + changelog before PR:
   - `DOCUMENTATION.md` for architecture/behavior
   - `CHANGELOG.md` for user-visible changes

## Definition of Done

A change is complete only when all items pass:

- Product behavior is verified locally (`python3 -m http.server 4173`)
- `./scripts/ship-check.sh` passes
- Generated artifacts are committed:
  - `/explore/`
  - `sitemap.xml`
- Documentation is updated if behavior/structure changed
- Changelog entry added if user-visible

## SEO and UX Guardrails

- Keep `index.html` as the main product experience.
- Keep `/explore/` pages as intent landing pages with clear links back to main experience.
- Use contextual internal links (related categories) instead of large link dumps.
- Keep copy human-readable and concise; avoid search-engine-only boilerplate.

## Design System Guardrails

- Reuse tokens in `styles.css`; avoid introducing ad hoc visual constants where tokenized values exist.
- Preserve accessibility patterns:
  - skip link
  - visible focus states
  - keyboard-operable controls
  - reduced-motion support
