function trackEvent(eventName, params) {
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

function updateMetaThemeColor() {
  var metaThemeColor = document.getElementById("meta-theme-color");
  if (!metaThemeColor) return;
  var color = getComputedStyle(document.documentElement)
    .getPropertyValue("--s-color-bg-page")
    .trim();
  if (color) {
    metaThemeColor.setAttribute("content", color);
  }
}

function updateToggleIcon(theme) {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  var current = document.documentElement.getAttribute("data-theme");
  var next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateToggleIcon(next);
  updateMetaThemeColor();
  trackEvent("toggle_theme", { theme: next, source: "seo_page" });
}

function showSnackbar(message, durationMs) {
  var snackbar = document.getElementById("snackbar");
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.classList.add("show");
  setTimeout(function() {
    snackbar.classList.remove("show");
  }, durationMs);
}

function copyKaomojiToClipboard(kaomoji, event) {
  var wrapper =
    event && event.currentTarget
      ? event.currentTarget.closest(".kaomoji-button-wrapper")
      : null;

  if (wrapper) {
    wrapper.classList.add("tooltip-hidden");
    wrapper.addEventListener(
      "mouseleave",
      function handler() {
        wrapper.classList.remove("tooltip-hidden");
        wrapper.removeEventListener("mouseleave", handler);
      },
      { once: true }
    );
  }

  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    showSnackbar("Copy not supported - try HTTPS or a different browser", 3000);
    return;
  }

  navigator.clipboard
    .writeText(kaomoji)
    .then(function() {
      showSnackbar(kaomoji + " copied to clipboard", 3000);
      trackEvent("copy_kaomoji", { kaomoji: kaomoji, source: "seo_page" });
    })
    .catch(function() {
      showSnackbar("Copy failed - try again", 2000);
    });
}

function initCopyButtons() {
  var buttons = document.querySelectorAll(".kaomoji-button[data-kaomoji]");
  buttons.forEach(function(btn) {
    btn.addEventListener("click", function(event) {
      copyKaomojiToClipboard(btn.getAttribute("data-kaomoji"), event);
    });
  });
}

function debounce(fn, delay) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

function scrollToTop() {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

function initBackToTop() {
  var backToTop = document.getElementById("back-to-top");
  var headerScrollBtn = document.querySelector(".header-scroll-to-top");
  if (!backToTop) return;

  var updateVisibility = function() {
    if (window.scrollY > 800) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  };

  backToTop.addEventListener("click", function() {
    scrollToTop();
    trackEvent("scroll_to_top", { source: "back_to_top_button", page_type: "seo" });
  });

  if (headerScrollBtn) {
    headerScrollBtn.addEventListener("click", function() {
      scrollToTop();
      trackEvent("scroll_to_top", { source: "header_logo", page_type: "seo" });
    });
  }

  window.addEventListener("scroll", debounce(updateVisibility, 50));
  updateVisibility();
}

document.addEventListener("DOMContentLoaded", function() {
  var theme = document.documentElement.getAttribute("data-theme") || "light";
  updateToggleIcon(theme);
  updateMetaThemeColor();

  var toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }

  initCopyButtons();
  initBackToTop();
});
