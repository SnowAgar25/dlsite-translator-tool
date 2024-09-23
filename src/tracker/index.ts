// tracker/index.ts

import { saveToIndexedDB, getFromIndexedDB, clearFromIndexedDB, CACHE_KEY } from './indexedDB';
import { modifyPage } from './pageModifier';
import { search, processSearchResults, updatePage } from './search';
import { createNavButtons, addNavButtonListeners } from './navButtonHandler';
import { injectTrackButtons } from './trackButton';
import { initCustomNavLinks } from 'src/nav-link';
import { initPreviewBox } from 'src/preview-box';
import { initTrackButtonHandler } from './trackButtonHandler';
import { config } from 'src/config';

const DLSITE_THEME = 'girls';
const BASE_URL = `https://www.dlsite.com/${DLSITE_THEME}/works/translatable`;
const TARGET_URL = `${BASE_URL}?keyword=%F0%9F%A5%B0`;

function cleanupExtraBodyElements() {
    const bodyElements = document.getElementsByTagName('body');
    if (bodyElements.length > 1) {
        // 保留第一個 body 元素，移除其他的
        for (let i = bodyElements.length - 1; i > 0; i--) {
            bodyElements[i].parentNode?.removeChild(bodyElements[i]);
        }
    }
}

export async function fetchAndCachePage(): Promise<string | null> {
    try {
        const response = await fetch(TARGET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        modifyPage(doc);

        const serializer = new XMLSerializer();
        const modifiedHtml = serializer.serializeToString(doc);

        await saveToIndexedDB(CACHE_KEY, modifiedHtml);
        return modifiedHtml;
    } catch (error) {
        console.error('獲取或緩存頁面時出錯:', error);
        return null;
    }
}

export async function showCachedPage(): Promise<void> {
    try {
        let cachedHtml = await getFromIndexedDB(CACHE_KEY);

        if (!cachedHtml) {
            cachedHtml = await fetchAndCachePage();
        }

        if (cachedHtml) {
            if (!document.body) {
                document.body = document.createElement('body'); // 確保 body 存在
            }
            document.body.innerHTML = cachedHtml;
            createNavButtons();
            addNavButtonListeners();
            await performSearchAndUpdate();
            initForCachedPage();
            setTimeout(() => {
                cleanupExtraBodyElements();
            }, 100);
        } else {
            throw new Error('無法顯示緩存頁面');
        }
    } catch (error) {
        console.error('顯示緩存頁面時出錯:', error);
        try {
            const newCachedHtml = await fetchAndCachePage();
            if (newCachedHtml) {
                showCachedPage();
            } else {
                throw new Error('無法獲取新的頁面內容');
            }
        } catch (fetchError) {
            console.error('重新獲取頁面失敗:', fetchError);
            alert('無法獲取或顯示頁面，請稍後再試。');
        }
    }
}

export async function clearCache(): Promise<void> {
    try {
        await clearFromIndexedDB(CACHE_KEY);
        alert(`緩存已清除`);
    } catch (error) {
        console.error('清除緩存時出錯:', error);
        alert('清除緩存失敗，請稍後再試。');
    }
}

function getTrackedWorks(): { [subdomain: string]: string[] } {
    const trackedWorksJson = localStorage.getItem('dlsite_tracked_works');
    return trackedWorksJson ? JSON.parse(trackedWorksJson) : {};
}

export async function performSearchAndUpdate(): Promise<void> {
    const trackedWorks = getTrackedWorks();

    const searchPromises = Object.entries(trackedWorks).map(([subdomain, productIds]) => {
        console.log(`搜索 ${subdomain}: ${productIds.join(', ')} 中...`);
        return search(subdomain, productIds);
    });

    const results = await Promise.all(searchPromises);
    const validResults = results.filter(result => result !== null);

    if (validResults.length > 0) {
        const allProductIds = Object.values(trackedWorks).flat();
        const { processedResults, totalCount } = processSearchResults(validResults, allProductIds);
        console.log('處理後的搜索結果數量:', processedResults.length);
        updatePage(processedResults, totalCount);
    } else {
        console.log('所有搜索均未找到結果');
        updatePage([], 0);
    }
}

const initForCachedPage = (): void => {
    if (config.modules.navLink.enabled) {
        initCustomNavLinks();
    }
    if (config.modules.previewBox.enabled) {
        initPreviewBox();
    }
    injectTrackButtons();
};

export function initTracker(): void {
    createNavButtons();
    addNavButtonListeners();
    injectTrackButtons();
    initTrackButtonHandler()
}