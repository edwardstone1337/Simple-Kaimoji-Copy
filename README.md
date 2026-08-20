# kaomoji.click

A static, data-driven kaomoji site. Browse 539 Japanese emoticons, click one to copy it.

No framework, no build step. Vanilla HTML, CSS and JavaScript served straight from
GitHub Pages.

## Quick start

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Core files

- `index.html` - the whole product, one page
- `script.js` - loads the data, renders the grid, handles filtering and copy
- `styles.css` - design tokens and component styles
- `kaomojis.json` - the single source of truth for content
- `design-system.html` - live component gallery, reads tokens from `styles.css`
- `404.html` - fallback for unmatched paths

## Ship gate

Run before opening a PR:

```bash
./scripts/ship-check.sh
```

It checks JS syntax, validates `kaomojis.json` (unknown categories, duplicate
kaomoji, empty categories) and enforces the no-em-dash rule.

## Adding kaomoji

Add an entry to the `kaomojis` array in `kaomojis.json`:

```json
{ "char": "ʕ•ᴥ•ʔ", "categories": ["bear"] }
```

`categories` must reference ids that already exist in the `categories` array.
Add `"popular": true` to surface it in the Popular band. Run the ship check
afterwards; it will catch typos and duplicates.

Source kaomoji from published references rather than composing new ones, and
prefer characters with broad font coverage - rare codepoints render as empty
boxes on many systems.

## More docs

- `DOCUMENTATION.md` - architecture and behaviour
- `CONTRIBUTING.md` - workflow and definition of done
