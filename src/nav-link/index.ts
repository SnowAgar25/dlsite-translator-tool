import { GM_addStyle } from '$';

function addNavLink(href: string, text: string, iconClass: string, iconContent: string): void {
    const addNavItem = () => {
        const navList = document.querySelector('.floorSubNav-item > ul.headerNav');
        if (!navList) return;

        const newNavItem = document.createElement('li');
        newNavItem.className = 'headerNav-item';

        const newLink = document.createElement('a');
        newLink.href = href;
        newLink.textContent = text;
        newLink.className = iconClass;

        newNavItem.appendChild(newLink);
        navList.appendChild(newNavItem);
    };

    // 立即嘗試添加導航項
    addNavItem();

    // 如果導航列表尚未加載，使用 MutationObserver 監視 DOM 變化
    if (!document.querySelector('.floorSubNav-item > ul.headerNav')) {
        const observer = new MutationObserver((_, obs) => {
            if (document.querySelector('.floorSubNav-item > ul.headerNav')) {
                addNavItem();
                obs.disconnect(); // 停止觀察
            }
        });

        const observeDOM = () => {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                // 如果 body 還不存在，等待一段時間後再次嘗試
                setTimeout(observeDOM, 10);
            }
        };

        observeDOM();
    }

    // 添加圖標樣式
    GM_addStyle(`
    .headerNav .headerNav-item .${iconClass}::before {
      content: "${iconContent}";
    }
  `);
}

export function initCustomNavLinks(): void {
    // 獲取當前子域名
    const subdomain = window.location.href.match(/dlsite\.com\/(\w+)/)?.[1];

    // 添加導航鏈接
    addNavLink(`https://www.dlsite.com/${subdomain}/works/translatable`, '翻訳許可作品', 'magnifying-glass', '\\f002');
    addNavLink('https://www.dlsite.com/translator/work', '翻訳申請', 'translate-icon', '\\f1ab');
}