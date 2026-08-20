# Changelog

## Unreleased

### Added

- 104 kaomoji recovered from the 2022 version of the site, which were lost when
  the data moved into `kaomojis.json`. Includes Lenny face and the look of
  disapproval, plus a `U(...)U` dog family and a `／(...)＼` cat family.
- 31 kaomoji sourced from published references to fill out pig, mouse, duck and
  monkey, which had 4 or 5 entries each.
- Filter sidebar with multi-select categories, live counts and a mobile drawer.
- Client-side search across kaomoji characters and category labels.
- Shareable filter state in `?c=` and `?q=` query params.
- Persistent Popular band at the top of the page.
- `404.html` fallback, so GitHub Pages no longer serves its generic one.
- Data integrity validation in the ship check: unknown category references,
  duplicate kaomoji, and empty categories now fail the build.

### Changed

- Homepage rebuilt around the sidebar. The two-tier scroll nav, its two
  IntersectionObservers, scroll-to-centre logic and back-to-top button are gone.
- Visual design reset to greyscale. The animated conic gradient card borders,
  rotating page gradient, noise overlay, scroll-reveal stagger, jelly hover and
  Japanese eyebrow labels have all been removed.
- Design system rebuilt as two honest tiers. Colour primitives now only define
  semantics; 17 ad hoc font sizes collapsed to a 7 step scale; z-index, border
  widths and radii are tokenised.
- `design-system.html` now reads tokens live from `styles.css` and measures
  contrast in the browser, so it cannot drift.
- Kaomoji buttons are labelled by category for screen readers instead of by
  their raw glyph.

### Fixed

- Mobile drawer focus trap did not trap. It counted checkboxes inside collapsed
  `<details>` as focusable, so its boundary was an element Tab never reaches;
  Tab escaped onto buttons behind the scrim.
- Opening the drawer focused the disabled "Clear all" button, a silent no-op,
  so focus never entered the dialog.
- The closed drawer left every accordion header in the mobile tab order as an
  invisible stop. It is now `inert`.
- Wide kaomoji overflowed a 375px viewport and forced the page to scroll
  sideways. They wrap below 420px.
- Contrast failures: `--text-faint` was 2.30:1 and the unchecked checkbox
  border was 1.49:1 in light theme. Text now clears 4.5:1 and identifying
  control boundaries 3:1 in both themes.
- `ship-check.sh` exited 1 on every run. It called `rg`, which is not installed,
  so the em dash check silently no-opped; and it diffed a sitemap whose
  `lastmod` was restamped on every run, so its artifact gate could never pass.

### Removed

- The `/explore/` tree: 39 generated SEO landing pages, `generate-seo-pages.js`,
  `seo-page.js` and `visual-check.sh`. Over 28 days they drew 12 views against
  the homepage's 48, all 33 category pages recorded zero views, and engagement
  time was 0 seconds.
- `components.js`, which existed to share markup with the page generator.
- `meta keywords`, ignored by search engines since 2009.
