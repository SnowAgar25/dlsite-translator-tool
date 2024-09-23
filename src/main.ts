import { initPreviewBox } from './preview-box';
import { initCustomNavLinks } from './nav-link';
import { initTracker, showCachedPage } from './tracker';

// 檢查 URL 是否包含 '?tracklist=true'
const isTracklist = window.location.href.includes('?tracklist=true');

if (isTracklist) {
  showCachedPage();
} else {
  initCustomNavLinks();

  function init() {
    initPreviewBox();
    initTracker();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}