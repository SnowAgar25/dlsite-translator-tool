import { initPreviewBox } from './preview-box';
import { initCustomNavLinks } from './nav-link';
import { initTracker, showCachedPage } from './tracker';
import { config, registerSettingsMenu } from './config';
import { initSettingsUI } from './config/settingsUI';

function initMainFeatures() {
  if (config.modules.previewBox.enabled) {
    initPreviewBox();
  }
  if (config.modules.tracker.enabled) {
    initTracker();
  }
}

function init() {
  const currentUrl = window.location.href;

  if (currentUrl.includes('dlsite-translator-tool')) {
    initSettingsUI();
    return;
  }

  if (currentUrl.includes('?tracklist=true')) {
    if (config.modules.tracker.enabled) {
      showCachedPage();
    }
    return;
  }

  if (config.modules.navLink.enabled) {
    initCustomNavLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainFeatures);
  } else {
    initMainFeatures();
  }
}

registerSettingsMenu();
init();

if (config.debug) {
  console.log('Debug mode is enabled');
}