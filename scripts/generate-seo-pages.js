const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SITE_URL = "https://www.kaomoji.click";
const TODAY = new Date().toISOString().slice(0, 10);

const dataPath = path.join(ROOT_DIR, "kaomojis.json");
const outputDir = path.join(ROOT_DIR, "explore");
const sitemapPath = path.join(ROOT_DIR, "sitemap.xml");

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const groups = data.groups || [];
const categories = data.categories || [];
const kaomojis = data.kaomojis || [];

const categoriesById = new Map(categories.map((category) => [category.id, category]));
const categoriesByGroup = new Map(groups.map((group) => [group.id, categories.filter((category) => category.group === group.id)]));
const kaomojisByCategory = new Map(categories.map((category) => [category.id, []]));

const RELATED_CATEGORY_HINTS = {
  cat: ["rabbit", "bear", "dog", "panda", "fox", "owl"],
  rabbit: ["cat", "bear", "dog", "panda", "mouse", "fox"],
  bear: ["cat", "panda", "dog", "rabbit", "fox", "owl"],
  dog: ["cat", "rabbit", "bear", "fox", "monkey", "panda"],
  panda: ["bear", "cat", "rabbit", "dog", "owl", "fox"],
  fox: ["cat", "dog", "rabbit", "bear", "owl", "monkey"],
  sadness: ["sympathy", "pain", "fear", "dissatisfaction", "confusion", "love"],
  pain: ["sadness", "fear", "sympathy", "dissatisfaction", "anger", "confusion"],
  fear: ["sadness", "pain", "surprise", "confusion", "doubt", "sympathy"],
  joy: ["love", "embarrassment", "sympathy", "surprise", "winking", "hugging"],
  love: ["joy", "embarrassment", "hugging", "winking", "sympathy", "greeting"],
  greeting: ["hugging", "winking", "apologizing", "joy", "love", "sympathy"],
};

kaomojis.forEach((item) => {
  if (!Array.isArray(item.categories)) return;
  item.categories.forEach((categoryId) => {
    const list = kaomojisByCategory.get(categoryId);
    if (!list) return;
    list.push(item);
  });
});

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function cleanOutput() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pageTitle(text) {
  return text + " | kaomoji.click";
}

function renderThemeInitScript() {
  return [
    "(function() {",
    "  var theme = localStorage.getItem('theme');",
    "  if (!theme) {",
    "    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';",
    "  }",
    "  document.documentElement.setAttribute('data-theme', theme);",
    "  var color = getComputedStyle(document.documentElement).getPropertyValue('--s-color-bg-page').trim();",
    "  if (color) {",
    "    document.getElementById('meta-theme-color').setAttribute('content', color);",
    "  }",
    "})();",
  ].join("\n");
}

function renderGtagScript() {
  return [
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-JKEBQ0M6NQ"></script>',
    "<script>",
    "  window.dataLayer = window.dataLayer || [];",
    "  function gtag() {",
    "    dataLayer.push(arguments);",
    "  }",
    "  gtag('js', new Date());",
    "  gtag('config', 'G-JKEBQ0M6NQ');",
    "</script>",
  ].join("\n");
}

function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: SITE_URL + item.path,
    })),
  };
}

function webPageJsonLd(title, description, pathName) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: SITE_URL + pathName,
    description,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "kaomoji.click",
      url: SITE_URL + "/",
    },
  };
}

function renderPrimaryNav(activePath) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/explore/", label: "Explore" },
  ];

  return links
    .map((link) => {
      const activeClass = link.href === activePath ? " active" : "";
      return (
        '<a class="nav-link' +
        activeClass +
        '" href="' +
        escapeHtml(link.href) +
        '">' +
        escapeHtml(link.label) +
        "</a>"
      );
    })
    .join("");
}

function renderKaomojiGrid(items, idPrefix) {
  if (!items || items.length === 0) {
    return '<p class="section-description">No kaomoji added yet for this category.</p>';
  }

  return (
    '<div class="kaomoji-grid" role="list" aria-label="Kaomoji list">' +
    items
      .map((item, index) => {
        const tooltipId = idPrefix + "-tooltip-" + index;
        const kaomoji = item.char;
        const escapedKaomoji = escapeHtml(kaomoji);
        return [
          '<div class="kaomoji-button-wrapper" role="listitem">',
          '<span id="' + escapeHtml(tooltipId) + '" class="kaomoji-tooltip">Click to copy</span>',
          '<button type="button" class="kaomoji-button" aria-describedby="' +
            escapeHtml(tooltipId) +
            '" aria-label="Copy kaomoji ' +
            escapedKaomoji +
            '" data-kaomoji="' +
            escapedKaomoji +
            '">',
          escapedKaomoji,
          "</button>",
          "</div>",
        ].join("");
      })
      .join("") +
    "</div>"
  );
}

function layout(options) {
  const title = options.title;
  const description = options.description;
  const pathName = options.pathName;
  const subtitle = options.subtitle;
  const heading = options.heading;
  const breadcrumbs = options.breadcrumbs;
  const content = options.content;
  const activeNavPath = options.activeNavPath;

  const breadcrumbLdJson = JSON.stringify(breadcrumbJsonLd(breadcrumbs), null, 2);
  const webPageLdJson = JSON.stringify(webPageJsonLd(title, description, pathName), null, 2);

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "  <title>" + escapeHtml(pageTitle(title)) + "</title>",
    '  <meta name="description" content="' + escapeHtml(description) + '" />',
    '  <link rel="canonical" href="' + escapeHtml(SITE_URL + pathName) + '" />',
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:title" content="' + escapeHtml(title) + '" />',
    '  <meta property="og:description" content="' + escapeHtml(description) + '" />',
    '  <meta property="og:url" content="' + escapeHtml(SITE_URL + pathName) + '" />',
    '  <meta property="og:site_name" content="kaomoji.click" />',
    '  <meta property="og:locale" content="en_US" />',
    '  <meta name="twitter:card" content="summary" />',
    '  <meta name="twitter:title" content="' + escapeHtml(title) + '" />',
    '  <meta name="twitter:description" content="' + escapeHtml(description) + '" />',
    '  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />',
    '  <link rel="preconnect" href="https://www.google-analytics.com" crossorigin />',
    renderGtagScript(),
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />',
    '  <link rel="stylesheet" href="/styles.css" />',
    '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />',
    '  <meta name="theme-color" content="#FFF8F9" id="meta-theme-color" />',
    "  <script>",
    renderThemeInitScript(),
    "  </script>",
    '  <script type="application/ld+json">',
    webPageLdJson,
    "  </script>",
    '  <script type="application/ld+json">',
    breadcrumbLdJson,
    "  </script>",
    "</head>",
    "<body>",
    '  <a href="#main-content" class="skip-link">Skip to content</a>',
    '  <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode"></button>',
    '  <header class="header-container">',
    '    <button type="button" class="header-scroll-to-top" aria-label="Scroll to top">',
    "      <h1>" + escapeHtml(heading) + "</h1>",
    '      <p class="subtitle">' + escapeHtml(subtitle) + "</p>",
    "    </button>",
    "  </header>",
    '  <div class="nav-wrapper">',
    '    <nav class="sticky-nav" aria-label="Primary navigation">',
    renderPrimaryNav(activeNavPath),
    "    </nav>",
    "  </div>",
    '  <div class="container">',
    '    <main id="main-content" class="seo-main">',
    content,
    "    </main>",
    "  </div>",
    '  <div id="snackbar" role="status" aria-live="polite" aria-atomic="true"></div>',
    '  <button type="button" class="back-to-top" id="back-to-top" aria-label="Back to top">Back to Top</button>',
    '  <script src="/seo-page.js"></script>',
    '  <div id="es-footer" data-project="kaomoji"></div>',
    '  <script type="module" src="https://footer.edwardstone.design/src/footer.js"></script>',
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

function writePage(relativePath, html) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, html, "utf8");
}

function categoryUrl(categoryId) {
  return "/explore/categories/" + categoryId + "/";
}

function groupUrl(groupId) {
  return "/explore/groups/" + groupId + "/";
}

function getRelatedCategories(category) {
  const siblings = (categoriesByGroup.get(category.group) || []).filter((entry) => entry.id !== category.id);
  if (siblings.length === 0) {
    return [];
  }

  const siblingsById = new Map(siblings.map((entry) => [entry.id, entry]));
  const hintedIds = RELATED_CATEGORY_HINTS[category.id] || [];

  const hinted = hintedIds.map((id) => siblingsById.get(id)).filter(Boolean);
  const hintedIdSet = new Set(hinted.map((entry) => entry.id));

  const fallback = siblings
    .filter((entry) => !hintedIdSet.has(entry.id))
    .sort((a, b) => {
      const countDiff = (kaomojisByCategory.get(b.id) || []).length - (kaomojisByCategory.get(a.id) || []).length;
      if (countDiff !== 0) return countDiff;
      return a.label.localeCompare(b.label);
    });

  return hinted.concat(fallback).slice(0, 6);
}

function uniqueKaomojiCountForGroup(groupId) {
  const groupCategoryIds = new Set((categoriesByGroup.get(groupId) || []).map((category) => category.id));
  return kaomojis.filter((item) => {
    if (!Array.isArray(item.categories)) return false;
    return item.categories.some((categoryId) => groupCategoryIds.has(categoryId));
  }).length;
}

function renderExploreHub() {
  const groupCards = groups
    .map((group) => {
      const groupCategories = categoriesByGroup.get(group.id) || [];
      const groupKaomojiCount = uniqueKaomojiCountForGroup(group.id);
      return [
        '<article class="seo-link-card">',
        '<h3><a href="' + escapeHtml(groupUrl(group.id)) + '">' + escapeHtml(group.label) + "</a></h3>",
        '<p class="section-description">' +
          escapeHtml(groupCategories.length + " categories and " + groupKaomojiCount + " kaomoji") +
          "</p>",
        '<p><a class="seo-inline-link" href="' + escapeHtml(groupUrl(group.id)) + '">View group page</a></p>',
        "</article>",
      ].join("");
    })
    .join("");

  const categoryCards = categories
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((category) => {
      const categoryCount = (kaomojisByCategory.get(category.id) || []).length;
      return [
        '<article class="seo-link-card seo-link-card-compact">',
        '<h3><a href="' + escapeHtml(categoryUrl(category.id)) + '">' + escapeHtml(category.label) + " Kaomoji</a></h3>",
        '<p class="section-description">' + escapeHtml(categoryCount + " kaomoji") + "</p>",
        "</article>",
      ].join("");
    })
    .join("");

  const html = layout({
    title: "Kaomoji Category Directory",
    description:
      "Browse focused kaomoji pages by category and emotion. Find copy-ready Japanese emoticons for moods, actions, and animals.",
    pathName: "/explore/",
    subtitle: "Japanese Emoticons - Click to Copy ✨",
    heading: "Kaomoji Explore",
    activeNavPath: "/explore/",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Explore", path: "/explore/" },
    ],
    content: [
      '<section class="content-section seo-content-section">',
      "  <h2>Explore Kaomoji by Intent</h2>",
      '  <p class="section-description">Use these focused pages to find kaomoji for a specific mood, action, or animal.</p>',
      "</section>",
      '<section class="content-section seo-content-section">',
      "  <h2>Browse by Group</h2>",
      '  <div class="seo-link-grid">',
      groupCards,
      "  </div>",
      "</section>",
      '<section class="content-section seo-content-section">',
      "  <h2>All Category Pages</h2>",
      '  <div class="seo-link-grid seo-link-grid-compact">',
      categoryCards,
      "  </div>",
      "</section>",
    ].join("\n"),
  });

  writePage("explore/index.html", html);
}

function renderGroupPages() {
  groups.forEach((group) => {
    const groupCategories = categoriesByGroup.get(group.id) || [];
    const categoryCards = groupCategories
      .map((category) => {
        const categoryItems = kaomojisByCategory.get(category.id) || [];
        const preview = categoryItems
          .slice(0, 6)
          .map((item) => '<button type="button" class="seo-chip kaomoji-button" data-kaomoji="' + escapeHtml(item.char) + '" aria-label="Copy kaomoji ' + escapeHtml(item.char) + '">' + escapeHtml(item.char) + "</button>")
          .join("");
        return [
          '<article class="seo-link-card">',
          '<h3><a href="' + escapeHtml(categoryUrl(category.id)) + '">' + escapeHtml(category.label) + " Kaomoji</a></h3>",
          '<p class="section-description">' + escapeHtml(category.description) + "</p>",
          '<p class="seo-meta-line">' + escapeHtml(categoryItems.length + " kaomoji") + "</p>",
          preview ? '<div class="seo-chip-row" aria-label="Example kaomoji">' + preview + "</div>" : "",
          "</article>",
        ].join("");
      })
      .join("");

    const html = layout({
      title: group.label + " Kaomoji Group",
      description:
        "Browse " +
        group.label.toLowerCase() +
        " kaomoji by category. Copy Japanese emoticons with one click.",
      pathName: groupUrl(group.id),
      subtitle: group.label + " and related categories",
      heading: group.label + " Kaomoji",
      activeNavPath: "/explore/",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore/" },
        { name: group.label, path: groupUrl(group.id) },
      ],
      content: [
        '<section class="content-section seo-content-section">',
        "  <h2>" + escapeHtml(group.label) + "</h2>",
        '  <p class="section-description">Choose a category to find the best matching kaomoji quickly.</p>',
        "</section>",
        '<section class="content-section seo-content-section">',
        "  <h2>Category Pages</h2>",
        '  <div class="seo-link-grid">',
        categoryCards,
        "  </div>",
        "</section>",
      ].join("\n"),
    });

    writePage(path.join("explore/groups", group.id, "index.html"), html);
  });
}

function renderCategoryPages() {
  categories.forEach((category) => {
    const items = kaomojisByCategory.get(category.id) || [];
    const group = groups.find((entry) => entry.id === category.group);
    const siblingCategories = getRelatedCategories(category);
    const relatedLinks = siblingCategories
      .map((entry) => '<li><a href="' + escapeHtml(categoryUrl(entry.id)) + '">' + escapeHtml(entry.label) + " Kaomoji</a></li>")
      .join("");
    const popularItems = items.filter((item) => item.popular).slice(0, 8);

    const html = layout({
      title: category.label + " Kaomoji (Copy and Paste)",
      description:
        "Copy " +
        category.label.toLowerCase() +
        " kaomoji for messages, bios, and posts. One-click Japanese emoticons for " +
        category.group.replace(/-/g, " ") +
        ".",
      pathName: categoryUrl(category.id),
      subtitle: (group ? group.label : "Category") + " - " + category.label,
      heading: category.label + " Kaomoji",
      activeNavPath: "/explore/",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore/" },
        group ? { name: group.label, path: groupUrl(group.id) } : { name: "Group", path: "/explore/" },
        { name: category.label, path: categoryUrl(category.id) },
      ],
      content: [
        '<section class="content-section seo-content-section">',
        "  <h2>" + escapeHtml(category.label) + " Kaomoji</h2>",
        '  <p class="section-description">' + escapeHtml(category.description) + "</p>",
        '  <ul class="seo-meta-list">',
        "    <li>" + escapeHtml(items.length + " total kaomoji") + "</li>",
        "    <li>One click copy support</li>",
        group ? "    <li>Group: " + escapeHtml(group.label) + "</li>" : "",
        "  </ul>",
        "</section>",
        '<section class="content-section seo-content-section">',
        "  <h2>Copy " + escapeHtml(category.label) + " Kaomoji</h2>",
        renderKaomojiGrid(items, "category-" + category.id),
        "</section>",
        popularItems.length
          ? [
              '<section class="content-section seo-content-section">',
              "  <h2>Popular Picks</h2>",
              renderKaomojiGrid(popularItems, "popular-" + category.id),
              "</section>",
            ].join("\n")
          : "",
        siblingCategories.length
          ? [
              '<section class="content-section seo-content-section">',
              "  <h2>Related Categories</h2>",
              '  <ul class="seo-inline-link-list">',
              relatedLinks,
              "  </ul>",
              "</section>",
            ].join("\n")
          : "",
      ].join("\n"),
    });

    writePage(path.join("explore/categories", category.id, "index.html"), html);
  });
}

function renderSitemap() {
  const urls = [
    { path: "/", priority: "1.0" },
    { path: "/explore/", priority: "0.9" },
    ...groups.map((group) => ({ path: groupUrl(group.id), priority: "0.8" })),
    ...categories.map((category) => ({ path: categoryUrl(category.id), priority: "0.7" })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) =>
      [
        "  <url>",
        "    <loc>" + SITE_URL + url.path + "</loc>",
        "    <lastmod>" + TODAY + "</lastmod>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>" + url.priority + "</priority>",
        "  </url>",
      ].join("\n")
    ),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(sitemapPath, xml, "utf8");
}

function main() {
  cleanOutput();
  renderExploreHub();
  renderGroupPages();
  renderCategoryPages();
  renderSitemap();
  console.log(
    "Generated SEO pages:",
    "1 explore hub,",
    groups.length,
    "group pages,",
    categories.length,
    "category pages, and sitemap.xml"
  );
}

main();
