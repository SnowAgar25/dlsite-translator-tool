import { initPreviewBox } from './previewBox';
import { addNavLink, addTranslationTableStyles } from './ui';

function init(): void {
  addNavLink('https://www.dlsite.com/maniax/works/translatable', '翻訳許可作品', 'magnifying-glass', '\\f002');
  addNavLink('https://www.dlsite.com/translator/work', '翻訳申請', 'translate-icon', '\\f1ab');
  addTranslationTableStyles();
  initPreviewBox();
}

init();