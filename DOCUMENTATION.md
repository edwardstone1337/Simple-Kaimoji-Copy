# Documentation

## What this is

A single static page listing 539 kaomoji. Click one and it goes to your clipboard.
Everything else exists to help you find the one you want.

## Stack

Vanilla HTML, CSS and JavaScript. No framework, no bundler, no dependencies.
Hosted on GitHub Pages at `www.kaomoji.click` (see `CNAME`). Fonts come from
Google Fonts; analytics is GA4 (`G-JKEBQ0M6NQ`).

## Data model

`kaomojis.json` is the single source of truth, with three arrays:

- **`groups`** - top level buckets: `{ id, label }`
- **`categories`** - each belongs to a group: `{ id, group, label, description }`
- **`kaomojis`** - `{ char, categories: string[], popular?: boolean }`

539 kaomoji across 33 categories in 5 groups. 22 are marked popular.

## Rendering flow

1. An inline script in `<head>` sets `data-theme` from localStorage or
   `prefers-color-scheme`, before first paint, so there is no flash.
2. `script.js` fetches `kaomojis.json` on `DOMContentLoaded`.
3. `normalise()` reorders groups so Animals is first (deepest group, most
   browsed) and flattens each kaomoji to `{ c, cats, pop }`.
4. The Popular band renders once. The main grid re-renders on every filter or
   search change.
5. Filter state is mirrored into `?c=` and `?q=` via `history.replaceState` so
   a filtered view can be shared.

## Filtering

Categories are **OR within the facet**. Selecting more categories can only ever
add results.

This is forced by the data, not a preference. 398 of 539 kaomoji carry exactly
one category, and 521 of the 528 possible category pairs share no kaomoji at
all. AND-combining two categories would return an empty set 98.7% of the time.
With OR, a zero-result state is unreachable by filtering, so no zero-result
prevention logic is needed.

Because there is only one real dimension, this is a multi-select filter rather
than faceted search. Per-option counts and disable-on-zero are kept because they
are cheap and honest, not because facets require them.

Search matches against the kaomoji characters and its category labels and
descriptions. It is the only thing that can produce an empty result.

Popular hides whenever any filter or search is active, so the user's own
results always occupy the top of the page.

## Design system

Two tiers, in `styles.css`:

- **Primitives** - `--n-*` is a single warm neutral ramp. These exist **only**
  to define semantics; components must never reference them directly.
  Structural primitives (`--step`, `--r-*`, `--bw-*`, `--fs-*`, `--dur-*`,
  `--z-*`) are meant for direct use.
- **Semantics** - `--bg`, `--surface`, `--text`, `--border`, `--accent`,
  `--focus` and friends. Redefined per `[data-theme]`. This is the only colour
  tier components may touch.

The palette is greyscale by choice. Spacing uses `calc(var(--step) * N)` with a
closed set of multipliers: 1 2 3 4 6 8 10 12 16 24. Type is a 7 step scale.

`design-system.html` is a live gallery that reads the tokens out of
`styles.css` at runtime and measures contrast in the browser, so it cannot
drift from the real values.

### Contrast

Text must clear 4.5:1 and identifying UI boundaries 3:1, in both themes.
`--border-control` exists specifically because an unchecked checkbox has no
fill, so its border is the only thing identifying it and must meet 3:1.
`--border-strong` draws hover and focus borders on controls that already have
a fill, so it is decorative and exempt.

## Accessibility notes

Several of these are non-obvious and easy to regress:

- **Copy tooltip visibility is pure CSS**, keyed off `:hover` and
  `:focus-visible`. JavaScript only ever swaps the label text. If you make JS
  toggle visibility, the tooltip will stick after a click, as it used to.
- **Buttons are labelled by category**, not by their glyph. A kaomoji read
  aloud is a stream of Unicode codepoint names, which is meaningless. The glyph
  itself is `aria-hidden`.
- **The mobile drawer's focus trap filters on `offsetParent !== null`.**
  Checkboxes inside a collapsed `<details>` match `querySelectorAll` but are
  skipped by real Tab, so using them as the trap boundary means the trap never
  fires and Tab escapes behind the scrim.
- **The closed drawer is `inert`** on narrow viewports. It is only translated
  off-screen, so without `inert` every accordion header stays in the tab order
  as an invisible stop.
- **Wide kaomoji wrap below 420px.** The longest is 363px, which overflows a
  375px phone and forces the whole page to scroll sideways.
- **The result count announcement is debounced to 700ms**, separately from the
  140ms visual debounce, so it does not interrupt a screen reader on every
  keystroke.

## SEO

The site is one page and the canonical is fixed at `https://www.kaomoji.click/`.
Filter state lives in query params written via `replaceState`; the canonical
must **not** be rewritten to match them, or every filter combination becomes a
thin near-duplicate URL.

`robots.txt` deliberately does not disallow `/explore/`. Those pages were
deleted; blocking an already-indexed path prevents Google from crawling it to
confirm it is gone, so a real 404 is what removes it from the index.

A previous version generated 39 `/explore/` landing pages. Over 28 days they
drew 12 views total against the homepage's 48, all 33 category pages recorded
zero, and engagement time was 0 seconds. They were removed.

## Shared footer

The Edward Stone footer is embedded from `footer.edwardstone.design` via a
mount point and an ES module:

```html
<div id="es-footer" data-project="kaomoji"></div>
<script type="module" src="https://footer.edwardstone.design/src/footer.js"></script>
```

It renders into a shadow root, so host page CSS cannot affect it. Source lives
in the `es-shared-footer` repo.
