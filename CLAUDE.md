# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project overview

kaomoji.click is a static, single-page kaomoji browser. 539 Japanese emoticons,
click one to copy it. Vanilla HTML, CSS and JavaScript. No framework, no build
step, no dependencies. Served from GitHub Pages at `www.kaomoji.click`.

The whole product is `index.html` + `script.js` + `styles.css` + `kaomojis.json`.
Keep it that way. This project was previously expanded into 40 pages with a
generator, a two-tier nav and a large decoration layer; that was reverted
because it made the product worse and drew no traffic. Resist re-adding
structure that does not serve "find a kaomoji, copy it".

## Development

```bash
python3 -m http.server 4173     # then open http://localhost:4173
./scripts/ship-check.sh         # run before committing
```

The ship check validates JS syntax, `kaomojis.json` integrity (unknown category
references, duplicate kaomoji, empty categories) and the no-em-dash rule.

## Architecture

### Data

`kaomojis.json` is the single source of truth: `groups`, `categories`,
`kaomojis`. A kaomoji may list several categories, though in practice almost all
list one.

### Filtering

Categories are **OR within the facet**. Do not change this to AND. 398 of 539
kaomoji carry exactly one category and 521 of 528 category pairs share no
kaomoji, so AND would return nothing 98.7% of the time. OR also makes a
zero-result state unreachable by filtering, which is why there is no
zero-result recovery UI.

Search is the only thing that can return nothing.

Popular hides whenever a filter or search is active.

### Design system

Two tiers in `styles.css`:

- `--n-*` colour primitives exist **only** to define semantics. Components must
  never reference them directly.
- Semantic tokens (`--bg`, `--surface`, `--text`, `--border`, `--accent`,
  `--focus`, ...) are the only colour tier components may use, and are
  redefined per `[data-theme]`.
- Structural primitives (`--step`, `--r-*`, `--bw-*`, `--fs-*`, `--dur-*`,
  `--z-*`) are intended for direct component use.

Spacing is `calc(var(--step) * N)` with a closed multiplier set: 1 2 3 4 6 8 10
12 16 24. Type is a 7 step scale. The palette is greyscale by choice.

`design-system.html` reads tokens live from `styles.css` and measures contrast
in the browser. Check changes against it; it cannot drift.

## Things that will silently regress

These were all real bugs. Read before touching the relevant code.

- **Copy tooltip visibility is pure CSS**, keyed off `:hover`/`:focus-visible`.
  JS only swaps the label text. If JS toggles visibility, the tooltip sticks
  after a click.
- **The drawer focus trap must filter on `offsetParent !== null`.** Checkboxes
  inside a collapsed `<details>` match `querySelectorAll` but are skipped by
  real Tab, so they make a phantom boundary and the trap never fires.
- **The closed drawer must be `inert`** on narrow viewports, or every accordion
  header stays in the tab order as an invisible stop.
- **Do not focus the first `button` in the sidebar** on drawer open. "Clear all"
  is disabled when no filters are active, and focusing a disabled element is a
  silent no-op.
- **Kaomoji buttons are labelled by category**, with the glyph `aria-hidden`.
  A kaomoji read aloud is a stream of codepoint names.
- **Keep the canonical fixed** at `https://www.kaomoji.click/`. Filter state is
  written to `?c=`/`?q=` via `replaceState`; rewriting canonical to match turns
  every combination into a thin duplicate URL.
- **Do not add `Disallow: /explore/` to robots.txt.** Those pages are deleted;
  blocking the path stops Google confirming the 404 and they linger in the index.

## Adding kaomoji

Source them from published references. Do not invent or adapt them. Prefer
characters with broad font coverage: rare codepoints render as empty boxes on
many systems, and stacking multiple rare scripts in one glyph is a guaranteed
tofu. Run the ship check, which catches duplicates and bad category references.

## Accessibility floor

- Text 4.5:1, identifying UI boundaries 3:1, in both themes
- Visible `:focus-visible` on everything, one shared treatment
- Keyboard operable throughout; drawer traps focus and returns it on close
- `prefers-reduced-motion` respected
- No horizontal page scroll at 375px

## Before finishing a task

- Read all user-visible copy; no jargon, no placeholder text
- Confirm GA (`G-JKEBQ0M6NQ`) is present on any new HTML page
- Confirm the shared footer mount is present on any new HTML page
- Check both themes, even when the change is not theme related
- Remove console.log and debug statements
- Run `./scripts/ship-check.sh` and confirm PASS
- Report every file changed and any concerns

## Documentation

Update `DOCUMENTATION.md` for architecture or behaviour changes, `CHANGELOG.md`
for user-visible changes, and this file for workflow or patterns future
instances need to know.
