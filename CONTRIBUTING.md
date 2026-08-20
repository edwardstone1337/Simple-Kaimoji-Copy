# Contributing

## Workflow

1. Make changes in small, reviewable commits.
2. Run the ship check: `./scripts/ship-check.sh`
3. Update docs before opening a PR:
   - `DOCUMENTATION.md` for architecture or behaviour
   - `CHANGELOG.md` for user-visible changes

## Definition of done

- Behaviour verified locally (`python3 -m http.server 4173`)
- `./scripts/ship-check.sh` passes
- Both themes checked, even if the change is not theme related
- Keyboard path checked, including the mobile drawer
- Docs updated if behaviour or structure changed
- Changelog entry added if user-visible

## Product guardrails

The product is one page: find a kaomoji, click it, it is on your clipboard.
Anything that does not serve that needs a strong reason.

This repo was previously expanded into 40 pages with a generator, a two-tier
nav and a heavy decoration layer. It drew no traffic and made the product worse,
and was reverted. Adding pages, navigation tiers or decoration is a regression
unless there is evidence behind it.

Do not add on-page copy for search engines. Metadata is fine; visible
keyword text is not.

## Design system guardrails

- Components reference **semantic** tokens only. `--n-*` colour primitives exist
  solely to define semantics.
- Use `calc(var(--step) * N)` for spacing, with the closed multiplier set:
  1 2 3 4 6 8 10 12 16 24.
- Use the 7 step type scale. New font sizes are drift.
- Check changes against `design-system.html`, which reads tokens live and
  measures contrast in the browser.

## Accessibility floor

- Text 4.5:1, identifying UI boundaries 3:1, both themes
- Visible focus on everything, using the shared treatment
- Keyboard operable throughout
- `prefers-reduced-motion` respected
- No horizontal page scroll at 375px

`CLAUDE.md` lists specific bugs in these areas that have already happened once.
Worth reading before touching the drawer, the tooltip or the aria labels.

## Adding kaomoji

Source from published references. Do not invent or adapt them. Prefer characters
with broad font coverage; rare codepoints render as empty boxes on many systems.
