function logError(context, error) {
  console.error('[kaomoji] ' + context + ':', error);
}

function trackEvent(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateToggleIcon(next);
  document.getElementById('meta-theme-color').setAttribute('content', next === 'dark' ? '#1a1a1a' : '#ffffff');
}

function updateToggleIcon(theme) {
  var btn = document.getElementById('theme-toggle');
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

var kaomojiData = null;
var groupObserver = null;
var categoryObserver = null;
var kaomojiTooltipIdCounter = 0;

function scrollNavToActive(navElement, activeLink) {
  if (!navElement || !activeLink) return;
  var linkLeft = activeLink.offsetLeft;
  var linkWidth = activeLink.offsetWidth;
  var navWidth = navElement.clientWidth;
  navElement.scrollTo({
    left: linkLeft - (navWidth / 2) + (linkWidth / 2),
    behavior: 'smooth'
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
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
}

function initBackToTop() {
  var backToTop = document.getElementById('back-to-top');
  var headerScrollBtn = document.querySelector('.header-scroll-to-top');
  if (!backToTop) return;

  var updateVisibility = function() {
    if (window.scrollY > 800) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  backToTop.addEventListener('click', function() {
    scrollToTop();
    trackEvent('scroll_to_top', { source: 'back_to_top_button' });
  });

  if (headerScrollBtn) {
    headerScrollBtn.addEventListener('click', function() {
      scrollToTop();
      trackEvent('scroll_to_top', { source: 'header_logo' });
    });
  }

  window.addEventListener('scroll', debounce(updateVisibility, 50));
  updateVisibility();
}

function initApp() {
  fetch('kaomojis.json')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to load kaomoji data');
      }
      return response.json();
    })
    .then(function(data) {
      if (!data || !Array.isArray(data.groups) || !Array.isArray(data.categories) || !Array.isArray(data.kaomojis)) {
        throw new Error('Invalid kaomoji data format');
      }
      kaomojiData = data;
      renderNav(data.groups);
      renderAllSections(data);
      initGroupObserver(data);
      initCategoryObserver();
      renderSubNav([]);
      updateOverflowClasses();
      window.addEventListener('resize', debounce(updateOverflowClasses, 150));
    })
    .catch(function(error) {
      logError('initApp', error);
      var main = document.getElementById('main-content');
      if (main) {
        main.innerHTML = '';
        var msg = document.createElement('p');
        msg.style.textAlign = 'center';
        msg.style.padding = '48px 16px';
        msg.style.color = 'var(--s-color-text-secondary)';
        msg.textContent = 'Unable to load kaomoji. Please refresh the page.';
        main.appendChild(msg);
      }
    });
}

function renderNav(groups) {
  var nav = document.getElementById('sticky-nav');
  nav.innerHTML = '';

  var popLink = document.createElement('a');
  popLink.href = '#popular';
  popLink.textContent = 'Popular';
  popLink.className = 'nav-link';
  popLink.addEventListener('click', function() {
    trackEvent('click_nav_group', { group_id: 'popular' });
  });
  nav.appendChild(popLink);

  groups.forEach(function(group) {
    var link = document.createElement('a');
    link.href = '#' + group.id;
    link.textContent = group.label;
    link.className = 'nav-link';
    link.addEventListener('click', function() {
      trackEvent('click_nav_group', { group_id: group.id });
    });
    nav.appendChild(link);
  });
}

function updateOverflowClasses() {
  var navs = [document.getElementById('sticky-nav'), document.getElementById('sub-nav')];
  navs.forEach(function(nav) {
    if (!nav) return;
    if (nav.scrollWidth > nav.clientWidth) {
      nav.classList.add('has-overflow');
    } else {
      nav.classList.remove('has-overflow');
    }
  });
}

function renderSubNav(categories) {
  var subNav = document.getElementById('sub-nav');
  subNav.innerHTML = '';
  if (categories.length === 0) {
    subNav.classList.add('hidden');
    updateOverflowClasses();
    return;
  }
  subNav.classList.remove('hidden');
  categories.forEach(function(cat) {
    var link = document.createElement('a');
    link.className = 'sub-nav-link';
    link.href = '#' + cat.id;
    link.textContent = cat.label;
    link.addEventListener('click', function() {
      trackEvent('click_nav_category', { category_id: cat.id });
    });
    subNav.appendChild(link);
  });
  updateOverflowClasses();
}

function initGroupObserver(data) {
  var main = document.getElementById('main-content');
  var sections = main.querySelectorAll('section.content-section');
  if (sections.length === 0) return;

  groupObserver = new IntersectionObserver(
    function(entries) {
      var firstIntersecting = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          firstIntersecting = entries[i];
          break;
        }
      }
      if (!firstIntersecting) return;

      var sectionId = firstIntersecting.target.id;
      var stickyNav = document.getElementById('sticky-nav');
      var navLinks = stickyNav.querySelectorAll('.nav-link');
      var activeLink = null;
      navLinks.forEach(function(link) {
        if (link.getAttribute('href') === '#' + sectionId) {
          link.classList.add('active');
          activeLink = link;
        } else {
          link.classList.remove('active');
        }
      });
      if (activeLink) {
        scrollNavToActive(document.getElementById('sticky-nav'), activeLink);
        trackEvent('view_group', { group_id: sectionId });
      }

      if (sectionId === 'popular') {
        renderSubNav([]);
      } else {
        var filtered = data.categories.filter(function(cat) { return cat.group === sectionId; });
        renderSubNav(filtered);
      }
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach(function(section) {
    groupObserver.observe(section);
  });
}

function initCategoryObserver() {
  var main = document.getElementById('main-content');
  var categorySections = main.querySelectorAll('div.category-section');
  if (categorySections.length === 0) return;

  categoryObserver = new IntersectionObserver(
    function(entries) {
      var firstIntersecting = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          firstIntersecting = entries[i];
          break;
        }
      }
      if (!firstIntersecting) return;

      var categoryId = firstIntersecting.target.id;
      var subNav = document.getElementById('sub-nav');
      var subLinks = subNav.querySelectorAll('.sub-nav-link');
      var activeSubLink = null;
      subLinks.forEach(function(link) {
        if (link.getAttribute('href') === '#' + categoryId) {
          link.classList.add('active');
          activeSubLink = link;
        } else {
          link.classList.remove('active');
        }
      });
      if (activeSubLink) {
        scrollNavToActive(document.getElementById('sub-nav'), activeSubLink);
        trackEvent('view_category', { category_id: categoryId });
      }
    },
    { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
  );

  categorySections.forEach(function(div) {
    categoryObserver.observe(div);
  });
}

function renderAllSections(data) {
  var main = document.getElementById('main-content');
  main.innerHTML = '';

  var popularSection = document.createElement('section');
  popularSection.id = 'popular';
  popularSection.className = 'content-section';

  var popHeading = document.createElement('h2');
  popHeading.textContent = 'Popular';
  popularSection.appendChild(popHeading);

  var popDesc = document.createElement('p');
  popDesc.className = 'section-description';
  popDesc.textContent = 'The most iconic kaomoji — click to copy.';
  popularSection.appendChild(popDesc);

  var popularKaomojis = data.kaomojis.filter(function(k) { return k.popular; });
  popularSection.appendChild(createKaomojiGrid(popularKaomojis));
  main.appendChild(popularSection);

  data.groups.forEach(function(group) {
    var section = document.createElement('section');
    section.id = group.id;
    section.className = 'content-section';

    var groupHeading = document.createElement('h2');
    groupHeading.textContent = group.label;
    section.appendChild(groupHeading);

    var groupCategories = data.categories.filter(function(cat) {
      return cat.group === group.id;
    });

    groupCategories.forEach(function(cat) {
      var catDiv = document.createElement('div');
      catDiv.id = cat.id;
      catDiv.className = 'category-section';

      var catHeading = document.createElement('h3');
      catHeading.textContent = cat.label;
      catDiv.appendChild(catHeading);

      var catDesc = document.createElement('p');
      catDesc.className = 'section-description';
      catDesc.textContent = cat.description;
      catDiv.appendChild(catDesc);

      var catKaomojis = data.kaomojis.filter(function(k) {
        return Array.isArray(k.categories) && k.categories.indexOf(cat.id) !== -1;
      });
      catDiv.appendChild(createKaomojiGrid(catKaomojis));

      section.appendChild(catDiv);
    });

    main.appendChild(section);
  });
}

function createKaomojiGrid(kaomojis) {
  var grid = document.createElement('div');
  grid.className = 'kaomoji-grid';

  kaomojis.forEach(function(k) {
    var tooltipId = 'kaomoji-tooltip-' + kaomojiTooltipIdCounter++;

    var wrapper = document.createElement('div');
    wrapper.className = 'kaomoji-button-wrapper';

    var tooltip = document.createElement('span');
    tooltip.id = tooltipId;
    tooltip.className = 'kaomoji-tooltip';
    tooltip.textContent = 'Click to copy';

    var btn = document.createElement('button');
    btn.className = 'kaomoji-button';
    btn.textContent = k.char;
    btn.setAttribute('aria-describedby', tooltipId);
    btn.addEventListener('click', function() {
      copyKaomojiToClipboard(k.char);
    });

    wrapper.appendChild(tooltip);
    wrapper.appendChild(btn);
    grid.appendChild(wrapper);
  });

  return grid;
}

function copyKaomojiToClipboard(kaomoji) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    var snackbar = document.getElementById('snackbar');
    snackbar.textContent = 'Copy not supported — try HTTPS or a different browser';
    snackbar.classList.add('show');
    setTimeout(function() { snackbar.classList.remove('show'); }, 3000);
    return;
  }
  navigator.clipboard
    .writeText(kaomoji)
    .then(function() {
      var snackbar = document.getElementById('snackbar');
      snackbar.classList.add('show');
      snackbar.innerText = kaomoji + ' copied to clipboard';
      setTimeout(function() {
        snackbar.classList.remove('show');
      }, 3000);
      trackEvent('copy_kaomoji', { kaomoji: kaomoji });
    })
    .catch(function(error) {
      logError('copyKaomoji', error);
      var snackbar = document.getElementById('snackbar');
      if (snackbar) {
        snackbar.textContent = 'Copy failed — try again';
        snackbar.classList.add('show');
        setTimeout(function() { snackbar.classList.remove('show'); }, 2000);
      }
    });
}

document.addEventListener('DOMContentLoaded', function() {
  var theme = document.documentElement.getAttribute('data-theme') || 'light';
  updateToggleIcon(theme);
  document.getElementById('theme-toggle').addEventListener('click', function() {
    toggleTheme();
    trackEvent('toggle_theme', { theme: document.documentElement.getAttribute('data-theme') });
  });
  initApp();
  initBackToTop();
});
