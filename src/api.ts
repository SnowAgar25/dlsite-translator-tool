import { GM_xmlhttpRequest } from '$';
import { ProductInfo, TranslationTable } from './types';

export async function fetchProductInfo(productId: string): Promise<ProductInfo> {
    const url = `https://www.dlsite.com/maniax/product/info/ajax?product_id=${productId}&cdn_cache_min=1`;

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
            onload: function (response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    const productInfo = data[productId];
                    if (productInfo) {
                        resolve(productInfo);
                    } else {
                        reject('Product info not found');
                    }
                } else {
                    reject(`Failed to fetch product info: ${response.status}`);
                }
            },
            onerror: function (error) {
                reject(`Error fetching product info: ${error}`);
            }
        });
    });
}

export async function fetchTranslationTable(productId: string, subDomain: string): Promise<TranslationTable> {
    const url = `https://www.dlsite.com/${subDomain}/works/translatable/ajax?keyword=${productId}`;

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
            onload: function (response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    const searchResult = data.search_result;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(searchResult, 'text/html');
                    const table = doc.querySelector('table.translation_table');
                    if (table) {
                        const tbody = table.querySelector('tbody');
                        const rows = tbody?.querySelectorAll('tr');
                        if (rows) {
                            // Keep only the first 5 rows
                            for (let i = 5; i < rows.length; i++) {
                                tbody?.removeChild(rows[i]);
                            }
                        }
                        resolve({ html: table.outerHTML });
                    } else {
                        reject('Translation table not found');
                    }
                } else {
                    reject(`Failed to fetch translation table: ${response.status}`);
                }
            },
            onerror: function (error) {
                reject(`Error fetching translation table: ${error}`);
            }
        });
    });
}