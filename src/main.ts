import { initPreviewBox } from './previewBox';
import { addTranslationTableStyles } from './ui';
import { initCustomNavLinks } from './nav-link';
import { initTracker } from './tracker';

initCustomNavLinks();

function init(): void {
  addTranslationTableStyles();
  initPreviewBox();
  initTracker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}