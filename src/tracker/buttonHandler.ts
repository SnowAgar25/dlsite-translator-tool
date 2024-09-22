// tracker/buttonHandler.ts

export function createButtons(): void {
    const navList = document.querySelector('ul.globalNav');
    if (navList) {
        const cacheButtonLi = document.createElement('li');
        cacheButtonLi.className = 'globalNav-item type-cache';
        cacheButtonLi.innerHTML = '<a href="#"><i>追蹤列表</i></a>';

        const clearCacheButtonLi = document.createElement('li');
        clearCacheButtonLi.className = 'globalNav-item type-clear-cache';
        clearCacheButtonLi.innerHTML = '<a href="#"><i>清除緩存</i></a>';

        navList.appendChild(cacheButtonLi);
        navList.appendChild(clearCacheButtonLi);
    }
}

export function addButtonListeners(showCachedPage: () => void, clearCache: () => void): void {
    const cacheButton = document.querySelector('.globalNav-item.type-cache a') as HTMLAnchorElement | null;
    const clearCacheButton = document.querySelector('.globalNav-item.type-clear-cache a') as HTMLAnchorElement | null;

    if (cacheButton) {
        cacheButton.addEventListener('click', function (e) {
            e.preventDefault();
            showCachedPage();
        });
    }

    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', function (e) {
            e.preventDefault();
            clearCache();
        });
    }
}