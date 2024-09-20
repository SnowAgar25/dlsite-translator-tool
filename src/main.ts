import { initPreviewBox } from './previewBox';
import { addTranslationTableStyles } from './ui';
import { initCustomNavLinks } from './nav-link';

initCustomNavLinks();

function init(): void {
  addTranslationTableStyles();
  initPreviewBox();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}