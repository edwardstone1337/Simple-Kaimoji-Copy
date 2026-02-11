(function(root, factory) {
  var components = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = components;
  }
  if (root) {
    root.KaomojiComponents = components;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function asKaomojiChar(item) {
    if (item && typeof item === 'object' && item.char) {
      return item.char;
    }
    return String(item || '');
  }

  function renderKaomojiGridHtml(items, options) {
    var safeOptions = options || {};
    var chars = Array.isArray(items) ? items.map(asKaomojiChar) : [];
    var emptyMessage = safeOptions.emptyMessage || 'No kaomoji added yet for this category.';
    var idPrefix = safeOptions.idPrefix || 'kaomoji';
    var ariaLabel = safeOptions.ariaLabel || 'Kaomoji list';
    var gridRole = ' role="list"';
    var itemRole = ' role="listitem"';

    if (chars.length === 0) {
      return '<p class="section-description">' + escapeHtml(emptyMessage) + '</p>';
    }

    return (
      '<div class="kaomoji-grid"' +
      gridRole +
      ' aria-label="' +
      escapeHtml(ariaLabel) +
      '">' +
      chars
        .map(function(kaomoji, index) {
          var escapedKaomoji = escapeHtml(kaomoji);
          var tooltipId = idPrefix + '-tooltip-' + index;

          return (
            '<div class="kaomoji-button-wrapper"' +
            itemRole +
            '>' +
            '<span id="' +
            escapeHtml(tooltipId) +
            '" class="kaomoji-tooltip">Click to copy</span>' +
            '<button type="button" class="kaomoji-button" aria-describedby="' +
            escapeHtml(tooltipId) +
            '" aria-label="Copy kaomoji ' +
            escapedKaomoji +
            '" data-kaomoji="' +
            escapedKaomoji +
            '">' +
            escapedKaomoji +
            '</button>' +
            '</div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function renderChipPreviewHtml(items, maxCount) {
    var chars = Array.isArray(items) ? items.map(asKaomojiChar) : [];
    var count = typeof maxCount === 'number' && maxCount > 0 ? Math.floor(maxCount) : 6;
    var previewChars = chars.slice(0, count);

    if (previewChars.length === 0) {
      return '';
    }

    return (
      '<div class="seo-chip-row" aria-label="Example kaomoji">' +
      previewChars
        .map(function(kaomoji) {
          var escapedKaomoji = escapeHtml(kaomoji);
          return (
            '<button type="button" class="seo-chip kaomoji-button" data-kaomoji="' +
            escapedKaomoji +
            '" aria-label="Copy kaomoji ' +
            escapedKaomoji +
            '">' +
            escapedKaomoji +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  return {
    escapeHtml: escapeHtml,
    renderKaomojiGridHtml: renderKaomojiGridHtml,
    renderChipPreviewHtml: renderChipPreviewHtml,
  };
});
