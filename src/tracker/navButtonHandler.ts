// tracker/buttonHandler.ts

import { clearCache } from ".";

export function createNavButtons(): void {
    const navList = document.querySelector('ul.floorTab');
    if (navList) {
        const cacheButtonLi = document.createElement('li');
        cacheButtonLi.className = 'floorTab-item type-cache';
        cacheButtonLi.innerHTML = `<a href="https://www.dlsite.com/${window.location.href.match(/dlsite\.com\/(\w+)/)?.[1] || 'home'}/?tracklist=true">追蹤列表</a>`;

        const clearCacheButtonLi = document.createElement('li');
        clearCacheButtonLi.className = 'floorTab-item type-clear-cache';
        clearCacheButtonLi.innerHTML = '<a href="#">清除緩存</a>';

        navList.appendChild(cacheButtonLi);
        navList.appendChild(clearCacheButtonLi);
    }
}

export function toTracklist(): void {
    const newUrl = `https://www.dlsite.com/${window.location.href.match(/dlsite\.com\/(\w+)/)?.[1] || 'home'}/?tracklist=true`;
    window.location.href = newUrl;
}

export function addNavButtonListeners(): void {
    const cacheButton = document.querySelector('.floorTab-item.type-cache a') as HTMLAnchorElement | null;
    const clearCacheButton = document.querySelector('.floorTab-item.type-clear-cache a') as HTMLAnchorElement | null;

    if (cacheButton) {
        cacheButton.addEventListener('click', function (e) {
            e.preventDefault();
            toTracklist();
        });
    }

    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', function (e) {
            e.preventDefault();
            clearCache();
        });
    }
}