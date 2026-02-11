# Simple Kaomoji Copy — Documentation

Single-page web app for browsing Japanese kaomoji (text faces) and copying them to the clipboard. All content is data-driven from `kaomojis.json`; the UI is rendered in JavaScript.

---

## Tech stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks or build step)
- **Data**: `kaomojis.json` — groups, categories, and kaomoji list; fetched at load
- **Hosting**: Static files; `CNAME` points to `www.kaomoji.click` (e.g. GitHub Pages)
- **Analytics**: Google Analytics (gtag.js, id `G-JKEBQ0M6NQ`)

---

## Project structure

| Path | Purpose |
|------|--------|
| `index.html` | Shell: skip-link, theme toggle, header, nav placeholders, main, snackbar. Inline theme init and GA. |
| `components.js` | Shared HTML rendering primitives (`escapeHtml`, kaomoji grid markup) used by both runtime and SEO generator |
| `script.js` | Fetches JSON, renders nav + sections, IntersectionObserver for active nav, copy + snackbar, theme toggle |
| `styles.css` | Primitives/semantic CSS variables, light/dark theme, layout, nav, grid, snackbar, responsive |
| `kaomojis.json` | Data: `groups`, `categories`, `kaomojis` (see Data model) |
| `scripts/generate-seo-pages.js` | Generates static SEO pages in `/explore/` from `kaomojis.json` and regenerates `sitemap.xml` |
| `scripts/ship-check.sh` | Release gate: syntax checks, SEO page regeneration checks, sitemap count checks, copy policy checks, optional visual snapshots |
| `scripts/visual-check.sh` | Playwright screenshot baseline check for key routes (`/`, `/explore/`, `/explore/categories/anger/`) |
| `seo-page.js` | Shared interactions for generated SEO pages (theme toggle, copy, snackbar, back-to-top) |
| `README.md` | Quick start and daily developer entrypoint |
| `CONTRIBUTING.md` | Definition of done, release workflow, and guardrails |
| `.github/workflows/ship-check.yml` | CI automation for ship checks on PRs and pushes to `main` |
| `.github/pull_request_template.md` | PR checklist enforcing docs/changelog and ship checks |
| `favicon.png` | 32×32 favicon |
| `robots.txt` | Allows all crawlers |
| `sitemap.xml` | URLs for home, explore hub, group pages, and category pages |
| `CNAME` | Custom domain for static host |

---

## How it works

1. **Load**  
   `index.html` loads. Inline script sets `data-theme` from `localStorage` or `prefers-color-scheme`. `script.js` runs on `DOMContentLoaded`: fetches `kaomojis.json`, then calls `initApp()`.

2. **Init**  
   - **Nav**: `renderNav(data.groups)` builds the sticky nav: “Popular” + one link per group (e.g. Positive Emotions, Negative Emotions, Actions, Animals).  
   - **Content**: `renderAllSections(data)` builds main: a “Popular” section (kaomojis with `popular: true`) with Japanese eyebrow label (`人気`) and a `.category-section` card wrapper around its kaomoji grid. Then one section per group. Each group section contains category cards (from `data.categories` for that group); each card has eyebrow label, heading, description, and a grid of kaomoji buttons.  
   - **Sub-nav**: Rendered by `renderSubNav(categories)`; shows category links for the current group. When “Popular” is in view, sub-nav is hidden.  
   - **Observers**: `IntersectionObserver` on sections updates the active link in the sticky nav and scrolls the nav so the active link is centered. A second observer on category blocks updates the active sub-nav link and scrolls the sub-nav.  
   - **Overflow**: `updateOverflowClasses()` adds `.has-overflow` to navs when they scroll; CSS applies horizontal fade masks.

3. **Copy**  
   Clicking a kaomoji button calls `copyKaomojiToClipboard(k.char)`.  
   - Uses `navigator.clipboard.writeText(kaomoji)`.  
   - Success: snackbar shows “{kaomoji} copied to clipboard”, hides after 3s; `gtag` event `copy_kaomoji`.  
   - No clipboard API or failure: snackbar shows “Copy not supported…” or “Copy failed…”.

4. **Theme**  
  Theme toggle (fixed top-right) switches `data-theme` between `light` and `dark`, updates `localStorage` and `meta-theme-color`. Icon: moon in light theme, sun in dark.

5. **SEO pages (`/explore/`)**
   Generated static pages provide crawlable intent-specific URLs:
   - Hub: `/explore/`
   - Group pages: `/explore/groups/{group-id}/`
   - Category pages: `/explore/categories/{category-id}/`
   These pages reuse the same design tokens and component styling (`styles.css`) and include JSON-LD breadcrumbs + canonical URLs.

---

## Regenerate SEO pages

When `kaomojis.json` changes, regenerate SEO pages and sitemap:

```bash
node scripts/generate-seo-pages.js
```

## Ship checklist (required)

Before shipping, run:

```bash
./scripts/ship-check.sh
```

This enforces:
- JS syntax is valid
- generated SEO pages and sitemap are in sync with `kaomojis.json`
- no em dashes in shipping copy files
- `/explore/` and `sitemap.xml` changes are committed

Optional visual snapshot gate:

```bash
SHIP_CHECK_VISUAL=1 ./scripts/ship-check.sh
```

Initialize or update screenshot baselines:

```bash
UPDATE_VISUAL_BASELINE=1 ./scripts/visual-check.sh
```

---

## Data model (`kaomojis.json`)

- **`groups`**: Array of `{ "id": string, "label": string }`. Top-level nav (e.g. Positive Emotions, Animals).
- **`categories`**: Array of `{ "id": string, "group": string, "label": string, "description": string }`. `group` matches a `groups[].id`. Sub-nav shows categories for the currently visible group.
- **`kaomojis`**: Array of `{ "char": string, "categories": string[], "popular"?: boolean }`.  
  - `categories` are category `id`s.  
  - `popular: true` includes the kaomoji in the “Popular” section.  
  - Each category block in the UI shows kaomojis whose `categories` include that category’s `id`.

---

## Functionality (current)

- **Popular section**: Kaomojis with `popular: true`; first section, includes eyebrow label (`人気`) and card shell; no sub-nav.
- **Group sections**: One section per group; each contains its categories and kaomoji grids.
- **Sticky nav**: “Popular” + group links; active section tracked by scroll (IntersectionObserver); horizontal scroll with fade when overflow.
- **Sub-nav**: Category links for current group; active category tracked by scroll; hidden on Popular.
- **Copy to clipboard**: One click per kaomoji; snackbar feedback; works in secure context (HTTPS/localhost).
- **Dark/light theme**: Toggle persists in `localStorage`; respects `prefers-color-scheme` on first visit.
- **Accessibility**: Skip link to main content; focus-visible outlines; theme toggle and buttons keyboard-usable.
- **SEO**: Title “Kaomoji — Copy Japanese Emoticons ʕ•ᴥ•ʔ | kaomoji.click”, meta description/keywords, canonical, OG/Twitter tags, schema.org WebSite JSON-LD.

---

## Styling summary

- **Variables**: `:root` defines primitives (`--p-color-*`, `--p-font-*`, `--p-space-*`, `--p-radius-*`) and semantics (`--s-color-bg-page`, `--s-color-text-primary`, etc.). `[data-theme="dark"]` overrides semantic colors. `@property --gradient-angle` enables animated conic borders on cards.
- **Layout**: Container max-width 960px; sticky nav wrapper with border-bottom; main content full width inside container.
- **Nav links**: Pill-style (full radius), now using display typeface token (`--p-font-display`); active state border + background; horizontal scroll, scrollbar hidden, optional mask when `.has-overflow`.
- **Category cards**: `.category-section` uses frosted-glass treatment (`backdrop-filter`) with large radius and an animated conic-gradient border via `::before`; dark mode swaps to neon gradient stops; reduced-motion disables border animation.
- **Kaomoji buttons**: Grid with gap; bordered, rounded; hover shadow, active inset shadow.
- **Snackbar**: Fixed bottom center, overlay colors, fade in/out, visible ~3s after copy.
- **Typography**: Group headings use a larger `h2` size (`28px` desktop), with the existing mobile override at ≤600px. Eyebrow labels use the `--p-font-size-sm` token.
- **Responsive**: At ≤600px, navs justify flex-start; section headings drop to `--p-font-size-lg`.

---

## Browser requirements

- **Clipboard**: Requires secure context (HTTPS or localhost) and `navigator.clipboard.writeText()`. Otherwise a message is shown in the snackbar.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
