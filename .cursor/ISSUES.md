# Issues

## Issue 1: Copy tooltip on kaomoji hover (desktop)

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
