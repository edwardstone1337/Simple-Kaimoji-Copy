# Issues

## Issue 1: Copy tooltip on kaomoji hover (desktop)

**Status:** Done - shipped, then rebuilt in `ea161fd`. Tooltip visibility is pure CSS keyed off `:hover`/`:focus-visible`; JS only swaps the label, so it cannot stick after a click.

**Type:** Improvement  
**Priority:** Normal  
**Effort:** Small

### TL;DR
Show a short tooltip on hover over kaomoji buttons so users know they can click to copy. Desktop only (no hover on touch).

### Current state
- Kaomoji tiles are clickable and copy to clipboard.
- There’s no hint that they’re clickable until the snackbar appears after copy.

### Expected outcome
- On **desktop** (hover-capable): hovering a kaomoji shows a tooltip, e.g. “Click to copy”.
- On **touch devices**: no tooltip (or rely on existing tap behavior); avoid showing tooltip on first tap.

### Relevant files
- `script.js` — where `.kaomoji-button` elements are created and click handler is attached; add `title` and/or a small custom tooltip, and gate on hover capability (e.g. `(hover: hover)` or no-touch detection).
- `styles.css` — optional styling for a custom tooltip (e.g. `--s-color-bg-overlay`, `--s-color-text-on-overlay`, `--p-radius-md`, `--p-space-*`) if not using native `title`.

### Notes / risk
- Use `@media (hover: hover)` so tooltip logic/styles only apply where hover exists.
- Native `title` is simplest and accessible; custom tooltip improves look but needs focus/keyboard and ARIA (e.g. `aria-describedby`) if you want it visible for keyboard users.

---

## Issue 2: Clickable logo + return-to-top button

**Status:** Done - the logo scrolls to top (`4a5eabb` added `scroll-margin-top` so it keeps the hero spacing). The floating return-to-top button was deliberately dropped in `ea161fd`: it only existed because the old two-tier nav made the page long, and the nav is gone.

**Type:** Feature  
**Priority:** Normal  
**Effort:** Medium

### TL;DR
Make the header logo (“顔文字”) clickable to scroll to top, and add a dedicated return-to-top control that matches the design system (tokens).

### Current state
- Header shows `<h1>顔文字</h1>` and subtitle; the heading is not interactive.
- No return-to-top button when the user has scrolled down.

### Expected outcome
- **Logo:** Wrapping the logo (and optionally the subtitle) in a link or button that scrolls to top (e.g. `#` or `scrollTo(0,0)` with smooth scroll). Visually unchanged; clearly clickable (cursor, maybe focus style).
- **Return-to-top button:** A floating button (e.g. bottom-right) that:
  - Appears after the user has scrolled down a reasonable amount (e.g. ~1–2 viewport heights).
  - On click, smooth-scrolls to the top.
  - Uses design tokens: e.g. `--s-color-bg-surface`, `--s-color-border-default`, `--s-color-text-primary`, `--p-radius-full` or `--p-radius-md`, `--p-space-*`, `--p-shadow-alpha` for shadow, and same transition pattern as `.theme-toggle` so it feels on-brand.
  - Accessible: visible focus ring, `aria-label="Return to top"` (or similar).

### Relevant files
- `index.html` — wrap header title (and optionally subtitle) in `<a href="#">` or `<button>` for “scroll to top”; optionally add a container for the return-to-top button.
- `script.js` — scroll listener to show/hide return-to-top button; click handler to scroll to top (can use `#` + `scroll-behavior: smooth` or `window.scrollTo({ top: 0, behavior: 'smooth' })`).
- `styles.css` — styles for clickable logo (no underline, hover/focus), and for return-to-top button using tokens; position fixed (e.g. bottom-right), z-index below theme toggle but above content; show/hide via class or visibility.

### Notes / risk
- Place return-to-top so it doesn’t overlap the theme toggle (e.g. bottom-right vs top-right).
- Respect `prefers-reduced-motion` for scroll behavior if you add a JS scroll (e.g. instant scroll when reduced-motion is preferred).

---

## Issue 3: Add og:image for social sharing

**Status:** Done in `63ce6bf`. 1200x630 `og-image.png` at repo root, `twitter:card` promoted to `summary_large_image`. `scripts/ship-check.sh` now fails if `index.html` references a local asset that is missing.

**Type:** Feature  
**Priority:** Normal  
**Effort:** Medium

### TL;DR
Create an Open Graph image (og:image) and add the meta tags so link previews look good when the site is shared on social platforms (Twitter, Facebook, Discord, etc.).

### Current state
- No `og:image`, `og:title`, `og:description`, or Twitter Card meta tags in `index.html`.
- Sharing the site falls back to platform defaults (often no image or generic favicon).
- `OG/` folder exists but contains an old/different project (Bootstrap, “Simple Kaomoji Copy”); not used by the current site.

### Expected outcome
- **Asset:** A single og:image asset (e.g. `og-image.png` or `og-image.jpg`) in the project root or an `assets/`-style folder.
  - Recommended size: **1200×630 px** (works well for Facebook, Twitter, Discord, LinkedIn).
  - On-brand: use “顔文字”, “Kaomoji — Japanese Emoticons”, and design tokens (e.g. `--p-color-*`, `--s-color-*` from `styles.css`, neutral palette, clean typography).
- **Meta tags** in `index.html` `<head>`:
  - `og:image` (absolute URL in production, e.g. `https://yoursite.com/og-image.png`).
  - `og:title`, `og:description`, `og:url`, `og:type` (e.g. `website`).
  - Optional: `twitter:card` (e.g. `summary_large_image`), `twitter:image`, `twitter:title`, `twitter:description` for Twitter.

### Relevant files
- **New:** Image file (e.g. `og-image.png`) — create in Figma, Canva, or code (e.g. HTML canvas or a one-off HTML page that you screenshot at 1200×630).
- `index.html` — add Open Graph and Twitter meta tags in `<head>`; ensure `og:image` uses an absolute URL when deployed (e.g. from `CNAME` or env).
- `styles.css` — reference only for brand tokens when designing the image (no code change required unless you generate the image via a build step).

### Notes / risk
- Use an **absolute URL** for `og:image` (e.g. `https://your-domain.com/og-image.png`). Relative paths often fail in crawlers.
- If the site is on GitHub Pages with a custom domain, the image URL should match that domain.
- Optional: add `og:image:width` and `og:image:height` (1200 and 630) to help some crawlers.

---

## Issue 4: Ship a kaomoji picker for Raycast and/or Alfred

**Status:** Open - not started. Research done 2026-08-20, see Notes / risk.

**Type:** Feature
**Priority:** Low (nothing depends on it, but it is the highest-leverage growth option available)
**Effort:** Large - roughly 14-24 hours active work for Raycast plus 1-3 weeks of review latency, or 7-12 hours for Alfred with no review gate

### TL;DR
Put the kaomoji list inside a Mac keyboard launcher, so someone hits a hotkey,
types `kaomoji bear`, presses Enter, and the character is on their clipboard
without a browser ever opening.

### Why this and not more SEO
Search Console shows 9 clicks in 16 months, average position 50. The head term
"kaomoji" is held by emojipedia (DR 91, 72k referring domains) and emojicombos
(DR 57, 5,600 referring domains), and kaomojis.jp has 55,000 entries against our
538. The realistic ceiling for organic search is 5-15 clicks a month. A launcher
extension reaches people through intent-based browsing in a store instead of
competing for a keyword, and `kaomojis.json` is already the right shape to feed
one. See the SEO section of `DOCUMENTATION.md` for the full numbers.

### Current state
- `kaomojis.json` holds 538 kaomoji, 33 categories, 5 groups, 22 popular. 56 KB.
- Nothing exists outside the website.
- Prior art on Raycast: **"Kaomoji Search" by yalishanda, 5,536 installs**, MIT.
  It is built on `asciilib`, a flat uncurated list with no categories, no
  descriptions and no popular curation. It is real competition, not empty ground.
- Prior art on Alfred: `dvor/alfred-kaomoji` (Swift, fetches from getdango.com,
  9 commits, 5 stars, stale) and `AsciiSearch`. Both thin. More room here.

### Expected outcome

**If Raycast** (bigger and growing audience, real in-app store discovery):
- React + TypeScript against `@raycast/api`. Scaffold from inside the Raycast app.
- `List` + `List.Item`, with `ActionPanel` and `Action.CopyToClipboard`. The core
  of this is close to boilerplate.
- Bundle `kaomojis.json` in `assets/`. Bundled assets are the documented pattern;
  do not fetch at runtime.
- Assets required for submission: 512x512 PNG icon that works on light and dark,
  3-6 screenshots at exactly 2000x1250, `README.md`, `CHANGELOG.md` in
  Keep-a-Changelog form with `## [Title] - {PR_MERGE_DATE}`.
- `npm run publish` opens a PR against the public `raycast/extensions` repo.

**If Alfred** (less work, ships immediately, smaller reach):
- A `.alfredworkflow` is a renamed ZIP with an `info.plist`, built in Alfred's
  visual editor. No compiler, no npm.
- A Script Filter runs a script on each keystroke and prints JSON; a Copy to
  Clipboard output object does the rest, so there is no clipboard code to write.
- Write it in JXA (`osascript -l JavaScript`) or Python 3, embedding the data as
  a literal. Genuinely zero build tooling, which matches this project.
- **Requires the paid Alfred Powerpack (~GBP 34).** Reach is limited to Alfred
  users who have paid, not everyone with Alfred installed.

### Recommendation
Raycast if only one gets built, because that is where the growing audience and
the actual discovery mechanism are. Alfred if the goal is to ship something this
weekend with no chance of rejection. This is a genuine trade-off between reach
and effort, not a clear win either way, so it is left as a decision rather than
settled here.

### Relevant files
- `kaomojis.json` - the data, vendored into the extension. Do not add a build
  step to sync it; it is 56 KB and changes in occasional batches, so a manual
  copy on publish is correct and matches the project's no-build-step rule.
- `CLAUDE.md` - the glyph coverage rule applies to whatever ships here too.

### Notes / risk
- **Duplicate-functionality rejection is the main Raycast risk.** Their
  guidelines list "existing extensions offer similar functionality" as grounds
  for rejection, and Kaomoji Search already has 5.5k installs. Lead the PR
  description with the differentiation (curated taxonomy, categories, popular
  set) rather than letting a reviewer find the overlap themselves.
- Raycast review runs up to 10-15 business days for the first pass, then 1-3
  days per round. PRs go stale after 14 days of inactivity and auto-close at 21.
- Raycast's API has had breaking migrations. An extension left untouched for a
  year can bit-rot against a newer `@raycast/api` major. Alfred's Script Filter
  JSON contract has been stable for years.
- **Data will exist in two places.** Whenever kaomoji are added, the extension
  copy needs updating too, or it silently drifts. Worth a line in `CLAUDE.md`
  when the first one ships.
- **Tofu:** both launchers render list text through the native macOS text system
  and its full font fallback chain, which is generally broader than a CSS
  `font-family` stack, so no new tofu is expected. That is inference, not
  documented behaviour - eyeball the popular set and a few rare-script entries
  in the launcher before shipping. This project has already been bitten twice by
  assuming glyph coverage.
