import { createPreviewBox, calculatePosition, addTranslationTableStyles } from './ui';
import { fetchProductInfo, fetchTranslationTable } from './api';
import { getWholesalePrice } from './utils';
import { ProductCache, ProductInfo } from './api';

let previewBox: HTMLDivElement | null = null;
let isVisible = false;
let hideTimeout: number | null = null;
let currentProductId: string | null = null;
let isFetching = false;
let fetchingProductId: string | null = null;
const productCache: ProductCache = {};

function showPreviewBox(x: number, y: number): void {
    if (!previewBox) return;

    clearTimeout(hideTimeout as number);

    previewBox.style.width = 'auto';
    previewBox.style.height = 'auto';

    const boxRect = previewBox.getBoundingClientRect();
    const { left, top } = calculatePosition(x, y, boxRect.width, boxRect.height);

    previewBox.style.left = `${left}px`;
    previewBox.style.top = `${top}px`;

    if (!isVisible) {
        isVisible = true;
        previewBox.style.opacity = '1';
        previewBox.style.display = 'block';
    }
}

function hidePreviewBox(): void {
    if (isVisible && previewBox) {
        isVisible = false;
        previewBox.style.opacity = '0';
        hideTimeout = window.setTimeout(() => {
            if (previewBox) previewBox.style.display = 'none';
            currentProductId = null;
            fetchingProductId = null;
        }, 300);
    }
}

async function handleMouseEnter(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href*="product_id/RJ"]');
    if (link instanceof HTMLAnchorElement) {
        link.removeAttribute('title');
        const productId = link.href.match(/product_id\/(\w+)/)?.[1];
        const subDomain = link.href.match(/dlsite\.com\/([^/]+)/)?.[1];
        if (productId && subDomain) {
            await fetchAndDisplayProductInfo(productId, event.clientX, event.clientY, subDomain);
        }
    }
}

async function fetchAndDisplayProductInfo(productId: string, x: number, y: number, subDomain: string): Promise<void> {
    if (productId === currentProductId) {
        showPreviewBox(x, y);
        return;
    }

    if (isFetching && fetchingProductId === productId) {
        return;
    }

    currentProductId = productId;
    showPreviewBox(x, y);

    if (productCache[productId]) {
        displayProductInfo(productCache[productId], productId, x, y, subDomain);
        return;
    }

    if (previewBox) previewBox.innerHTML = '加載中...';

    try {
        isFetching = true;
        fetchingProductId = productId;
        const productInfo = await fetchProductInfo(productId);
        productCache[productId] = productInfo;
        if (currentProductId === productId) {
            displayProductInfo(productInfo, productId, x, y, subDomain);
        }
    } catch (error) {
        console.error('Error fetching product info:', error);
        if (previewBox && currentProductId === productId) previewBox.innerHTML = '加載失敗';
    } finally {
        isFetching = false;
        fetchingProductId = null;
    }
}

function displayProductInfo(info: ProductInfo, productId: string, x: number, y: number, subDomain: string): void {
    if (!previewBox || currentProductId !== productId) return;

    const translationInfo = info.translation_info;
    const content: string[] = [];

    if (translationInfo.is_translation_agree) {
        content.push(`<span style="color: green;">允許翻譯</span>`);
    }

    if (!translationInfo.is_translation_agree && !translationInfo.original_workno) {
        content.push(`<span style="color: red;">不允許翻譯</span>`);
    }

    if (translationInfo.original_workno) {
        content.push(`<span style="color: blue;">已是翻譯作品</span>`);
    }

    if (translationInfo.is_translation_agree) {
        const translatorRate = 100 - translationInfo.production_trade_price_rate;
        content.push(`譯者分成: ${translatorRate}%`);

        if (info.official_price) {
            const 卸価格 = getWholesalePrice(info.official_price);
            if (卸価格) {
                const predictedCompensation = Math.floor(卸価格 * (translatorRate / 100));
                content.push(`預測報酬: ${predictedCompensation} 日元 (基於卸価格 ${卸価格} 日元)`);
            } else {
                content.push(`無法計算預測報酬 (未找到對應的卸価格)`);
            }
        }
    }

    previewBox.innerHTML = content.join('<br>');

    showPreviewBox(x, y);

    if (translationInfo.is_translation_agree) {
        if (productCache[productId].translationTable) {
            previewBox.innerHTML += '<br>' + productCache[productId].translationTable;
            showPreviewBox(x, y);
        } else {
            fetchTranslationTable(productId, subDomain)
                .then(table => {
                    if (previewBox && currentProductId === productId) {
                        previewBox.innerHTML += '<br>' + table.html;
                        productCache[productId].translationTable = table.html;
                        showPreviewBox(x, y);
                    }
                })
                .catch(error => {
                    console.error('Error fetching translation table:', error);
                });
        }
    }
}

export function initPreviewBox(): void {
    addTranslationTableStyles()
    previewBox = createPreviewBox();
    document.body.addEventListener('mouseover', handleMouseEnter);
    document.body.addEventListener('mousemove', (e: MouseEvent) => isVisible && showPreviewBox(e.clientX, e.clientY));
    document.body.addEventListener('mouseout', hidePreviewBox);
}