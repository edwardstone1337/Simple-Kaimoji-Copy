/* kaomoji.click
 *
 * Loads kaomojis.json, renders a filterable grid, copies on click.
 *
 * Filtering note: categories are OR within the facet, so selecting more can
 * only ever ADD results. That is deliberate and forced by the data: 98.7% of
 * category pairs share no kaomoji at all, so AND would return an empty set
 * almost every time anyone combined two selections. With OR, a zero-result
 * state is unreachable by filtering.
 */

const TIP = "Click to copy";
/* Animals first: it is the deepest group and the one people browse most. */
const GROUP_ORDER = ["animals", "positive-emotions", "negative-emotions", "neutral-emotions", "actions"];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const isNarrow = () => window.matchMedia("(max-width:900px)").matches;

function trackEvent(name, params) {
  if (typeof gtag === "function") gtag("event", name, params || {});
}

let D = null;
let catById = {};
const state = { cats: new Set(), q: "" };
let announceT;

/* ---------------------------------------------------------------- filtering */

function matches(k, s = state) {
  if (s.cats.size && !k.cats.some((c) => s.cats.has(c))) return false;
  if (s.q) {
    const q = s.q.toLowerCase();
    const hay = k.cats
      .map((c) => (catById[c] ? catById[c].label + " " + (catById[c].description || "") : c))
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q) && !k.c.toLowerCase().includes(q)) return false;
  }
  return true;
}

const countFor = (id) => D.kaomojis.filter((k) => matches(k, { ...state, cats: new Set([id]) })).length;

/* ------------------------------------------------------------------ markup */

const CHEV = `<svg class="chev" aria-hidden="true" focusable="false" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 9l7 7 7-7"/></svg>`;
const XICON = `<svg aria-hidden="true" focusable="false" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`;

/* A kaomoji's characters read aloud as a stream of Unicode names, which tells
   a screen reader user nothing. Name the button by what the face means. */
function describe(k) {
  const label = k.cats.map((id) => catById[id] && catById[id].label).filter(Boolean)[0];
  return label ? `Copy ${label.toLowerCase()} kaomoji` : "Copy kaomoji";
}

function mojiHtml(k) {
  const d = describe(k);
  return `<button class="moji" data-c="${esc(k.c)}" data-tip="${TIP}" aria-label="${esc(d)}" data-desc="${esc(d)}"><span aria-hidden="true">${esc(k.c)}</span></button>`;
}

/* The empty state's kaomoji is a real one from the dataset and behaves like
   every other button on the page, so a dead end still gives you something. */
const EMPTY_MOJI = { c: "(・_・ヾ", cats: ["confusion"], pop: false };

function emptyHtml() {
  return `<div class="empty">
    ${mojiHtml(EMPTY_MOJI)}
    <p>Nothing matches that. You can still copy this one.</p>
    <button class="btn" id="reset" type="button">Clear search and filters</button>
  </div>`;
}

function optHtml(id, label, n, checked) {
  const dead = n === 0 && !checked;
  return `<label class="opt${dead ? " zero" : ""}">
    <input type="checkbox" data-c="${esc(id)}" ${checked ? "checked" : ""} ${dead ? "disabled" : ""}>
    <span class="lbl">${esc(label)}</span><span class="cnt">${n}</span></label>`;
}

function renderFacets() {
  /* preserve whatever the user has opened across re-renders */
  const openState = {};
  document.querySelectorAll("details.fgroup").forEach((d) => (openState[d.dataset.g] = d.open));

  document.getElementById("facets").innerHTML = D.groups
    .map((g) => {
      const cats = D.categories.filter((c) => c.group === g.id);
      const n = cats.filter((c) => state.cats.has(c.id)).length;
      /* Animals opens by default on desktop so there is an immediate path into
         a category. On mobile the drawer is already an explicit action and an
         open group would push the rest off-screen, so everything starts shut. */
      const defaultOpen = n > 0 || (g.id === "animals" && !isNarrow());
      const open = openState[g.id] !== undefined ? openState[g.id] : defaultOpen;
      return `<details class="fgroup" data-g="${esc(g.id)}" ${open ? "open" : ""}>
      <summary>${esc(g.label)} ${n ? `<span class="badge">${n}</span>` : ""}${CHEV}</summary>
      <div class="fbody" role="group" aria-label="${esc(g.label)}">
        ${cats.map((c) => optHtml(c.id, c.label, countFor(c.id), state.cats.has(c.id))).join("")}
      </div></details>`;
    })
    .join("");
}

function render() {
  const list = D.kaomojis.filter((k) => matches(k));

  document.getElementById("grid").innerHTML = list.length ? list.map(mojiHtml).join("") : emptyHtml();

  document.getElementById("count").innerHTML = `<b>${list.length}</b> kaomoji`;

  /* The count updates visually on every keystroke, but announcing that often
     interrupts a screen reader mid-word. Announce only once typing settles. */
  clearTimeout(announceT);
  announceT = setTimeout(() => {
    document.getElementById("live").textContent = `${list.length} kaomoji shown`;
  }, 700);

  /* Popular is the default landing shortcut. The moment the user narrows
     anything, their results take the top spot and Popular steps aside. */
  document.getElementById("popular-band").hidden = !!state.q || state.cats.size > 0;

  const active = [...state.cats].map((id) => ({ id, label: catById[id].label }));
  document.getElementById("chips").innerHTML = active
    .map(
      (a) =>
        `<span class="chip">${esc(a.label)}<button class="icon-btn icon-btn--sm" data-x="${esc(a.id)}" aria-label="Remove ${esc(a.label)} filter">${XICON}</button></span>`
    )
    .join("");

  document.getElementById("clear").disabled = !active.length;
  const fc = document.getElementById("fcount");
  fc.textContent = active.length;
  fc.hidden = !active.length;
  document.getElementById("qclear").hidden = !state.q;

  renderFacets();
  syncUrl();
}

/* --------------------------------------------------------------- URL state */

function syncUrl() {
  const p = new URLSearchParams();
  if (state.cats.size) p.set("c", [...state.cats].join(","));
  if (state.q) p.set("q", state.q);
  const s = p.toString();
  history.replaceState(null, "", s ? "?" + s : location.pathname);
}

function readUrl() {
  const p = new URLSearchParams(location.search);
  (p.get("c") || "")
    .split(",")
    .filter(Boolean)
    .forEach((c) => catById[c] && state.cats.add(c));
  state.q = p.get("q") || "";
  if (state.q) document.getElementById("q").value = state.q;
}

/* ------------------------------------------------------------------- theme */

function applyTheme(next) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  const btn = document.getElementById("theme");
  btn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  const meta = document.getElementById("meta-theme-color");
  if (bg && meta) meta.setAttribute("content", bg);
}

/* ------------------------------------------------------------------ drawer */

function initDrawer() {
  const ft = document.getElementById("ftoggle");
  const side = document.getElementById("side");
  const isOpen = () => document.body.classList.contains("drawer");

  /* Only rendered elements are focusable. Checkboxes inside a COLLAPSED
     <details> match querySelectorAll but are skipped by real Tab, so using
     them as the trap boundary means the trap never fires. */
  const focusables = () =>
    [...side.querySelectorAll("summary, input:not([disabled]), button:not([disabled])")].filter(
      (el) => el.offsetParent !== null
    );

  /* When shut, the drawer is only translated off-screen, so without this every
     accordion header stays in the mobile tab order as an invisible stop. */
  function syncInert() {
    if (isNarrow() && !isOpen()) side.setAttribute("inert", "");
    else side.removeAttribute("inert");
  }

  function open() {
    document.body.classList.add("drawer");
    ft.setAttribute("aria-expanded", "true");
    side.setAttribute("role", "dialog");
    side.setAttribute("aria-modal", "true");
    syncInert();
    (focusables()[0] || side).focus();
  }
  function close() {
    document.body.classList.remove("drawer");
    ft.setAttribute("aria-expanded", "false");
    side.removeAttribute("role");
    side.removeAttribute("aria-modal");
    syncInert();
    ft.focus();
  }

  ft.addEventListener("click", () => (isOpen() ? close() : open()));
  document.getElementById("scrim").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  window.addEventListener("resize", syncInert);
  syncInert();
}

/* -------------------------------------------------------------------- copy */

function initCopy() {
  const mascot = document.getElementById("mascot");
  const brand = document.querySelector(".brand");
  const snack = document.getElementById("snack");
  const timers = new WeakMap();
  let snackT;
  let mascotT;

  document.getElementById("results").addEventListener("click", async (e) => {
    const b = e.target.closest(".moji");
    if (!b) return;

    let ok = true;
    try {
      await navigator.clipboard.writeText(b.dataset.c);
    } catch (err) {
      ok = false;
    }

    /* Swap the tooltip's label, never its visibility. Visibility is pure CSS
       keyed off :hover, so the tooltip cannot get stuck after a click. */
    b.dataset.tip = ok ? "Copied" : "Copy failed";
    clearTimeout(timers.get(b));
    timers.set(b, setTimeout(() => (b.dataset.tip = TIP), 1100));
    if (!ok) return;

    trackEvent("copy_kaomoji", { kaomoji: b.dataset.c });

    /* the bear in the wordmark notices */
    mascot.textContent = "ʕ♥ᴥ♥ʔ";
    brand.classList.add("happy");
    clearTimeout(mascotT);
    mascotT = setTimeout(() => {
      mascot.textContent = "ʕ•ᴥ•ʔ";
      brand.classList.remove("happy");
    }, 1200);

    document.getElementById("snack-what").textContent = b.dataset.c;
    document.getElementById("snack-sr").textContent =
      (b.dataset.desc || "Kaomoji").replace(/^Copy /, "") + " copied to clipboard";
    snack.classList.add("show");
    clearTimeout(snackT);
    snackT = setTimeout(() => snack.classList.remove("show"), 2000);
  });
}

/* -------------------------------------------------------------------- boot */

function normalise(raw) {
  const ordered = GROUP_ORDER.map((id) => raw.groups.find((g) => g.id === id)).filter(Boolean);
  for (const g of raw.groups) if (!ordered.includes(g)) ordered.push(g);
  return {
    groups: ordered,
    categories: raw.categories,
    kaomojis: raw.kaomojis.map((k) => ({ c: k.char, cats: k.categories, pop: !!k.popular })),
  };
}

async function init() {
  let raw;
  try {
    const res = await fetch("kaomojis.json");
    if (!res.ok) throw new Error(res.status);
    raw = await res.json();
  } catch (err) {
    document.getElementById("grid").innerHTML =
      `<div class="empty"><span class="big">(&#183;_&#183;;)</span>Could not load the kaomoji. Try refreshing.</div>`;
    return;
  }

  D = normalise(raw);
  catById = Object.fromEntries(D.categories.map((c) => [c.id, c]));

  document.getElementById("popular-grid").innerHTML = D.kaomojis
    .filter((k) => k.pop)
    .map(mojiHtml)
    .join("");

  document.getElementById("facets").addEventListener("change", (e) => {
    const i = e.target;
    if (!i.dataset.c) return;
    i.checked ? state.cats.add(i.dataset.c) : state.cats.delete(i.dataset.c);
    trackEvent("filter_category", { category: i.dataset.c, active: i.checked });
    render();
  });
  document.getElementById("chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]");
    if (!b) return;
    state.cats.delete(b.dataset.x);
    render();
  });
  document.getElementById("clear").addEventListener("click", () => {
    state.cats.clear();
    render();
  });

  /* The empty state's reset is rebuilt on every render, so listen on the
     container rather than binding to a button that will be replaced. */
  document.getElementById("grid").addEventListener("click", (e) => {
    if (!e.target.closest("#reset")) return;
    state.cats.clear();
    state.q = "";
    document.getElementById("q").value = "";
    render();
  });

  const qInput = document.getElementById("q");
  let qt;
  qInput.addEventListener("input", (e) => {
    clearTimeout(qt);
    qt = setTimeout(() => {
      state.q = e.target.value.trim();
      render();
    }, 140);
  });
  document.getElementById("qclear").addEventListener("click", () => {
    qInput.value = "";
    state.q = "";
    render();
    qInput.focus();
  });

  document.getElementById("theme").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  applyTheme(document.documentElement.dataset.theme || "dark");

  initDrawer();
  initCopy();
  readUrl();
  render();
}

document.addEventListener("DOMContentLoaded", init);
