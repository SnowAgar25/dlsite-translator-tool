// tracker/index.ts

import { saveToIndexedDB, getFromIndexedDB, clearFromIndexedDB, CACHE_KEY } from './indexedDB';
import { modifyPage } from './pageModifier';
import { search, processSearchResults, updatePage } from './search';
import { createButtons, addButtonListeners } from './buttonHandler';

const DLSITE_THEME = 'girls';
const BASE_URL = `https://www.dlsite.com/${DLSITE_THEME}/works/translatable`;
const TARGET_URL = `${BASE_URL}?keyword=%F0%9F%A5%B0`;

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
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100vh';
            iframe.style.border = 'none';
            document.body.innerHTML = '';
            document.body.appendChild(iframe);

            const iframeDocument = iframe.contentDocument;
            if (iframeDocument) {
                iframeDocument.open();
                iframeDocument.write(cachedHtml);
                iframeDocument.close();

                iframe.onload = () => {
                    createButtons();
                    addButtonListeners(showCachedPage, clearCache);
                    performSearchAndUpdate(iframeDocument);
                };
            } else {
                throw new Error('無法獲取 iframe 的內容文檔');
            }
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

export async function performSearchAndUpdate(iframeDocument: Document): Promise<void> {
    const searchParams = {
        'maniax': ['RJ01248548', 'RJ01217348', 'RJ01248996', 'RJ01234443', 'RJ01255148', 'RJ01248548', 'RJ01251469', 'RJ01238176', 'RJ01221693', 'RJ01246834', 'RJ01242051', 'RJ01241016', 'RJ01240596', 'RJ01217348'],
        'girls': ['RJ01254876', 'RJ01251876', 'RJ01248132'],
    };

    const searchPromises = Object.entries(searchParams).map(([subdomain, keywords]) => {
        console.log(`搜索 ${subdomain}: ${keywords.join(', ')} 中...`);
        return search(subdomain, keywords);
    });

    const results = await Promise.all(searchPromises);
    const validResults = results.filter(result => result !== null);

    if (validResults.length > 0) {
        const allKeywords = Object.values(searchParams).flat();
        const { processedResults, totalCount } = processSearchResults(validResults, allKeywords);
        console.log('處理後的搜索結果數量:', processedResults.length);
        updatePage(iframeDocument, processedResults, totalCount);
    } else {
        console.log('所有搜索均未找到結果');
        updatePage(iframeDocument, [], 0);
    }
}

export function initTracker(): void {
    createButtons();
    addButtonListeners(showCachedPage, clearCache);

    if (window.location.href.startsWith(BASE_URL)) {
        fetchAndCachePage();
    }
}