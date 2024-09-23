import { GM_xmlhttpRequest } from '$';

export type ProductCache = Record<string, ProductInfo>;

export interface ProductInfo {
    translationTable?: string;
    translation_info: {
        is_translation_agree: boolean;
        is_volunteer: boolean;
        original_workno: string | null;
        production_trade_price_rate: number;
    };
    official_price: number;
}


export interface TranslationTable {
    html: string;
}

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
                if (response.status !== 200) {
                    reject(`Failed to fetch translation table: ${response.status}`);
                    return;
                }

                const data = JSON.parse(response.responseText);
                const searchResult = data.search_result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(searchResult, 'text/html');

                const targetDiv = doc.querySelector(`li.search_result_img_box_inner > div[data-product_id="${productId}"]`);
                if (!targetDiv) {
                    reject(`Div with data-product_id="${productId}" not found`);
                    return;
                }

                const parentElement = targetDiv.parentElement;
                if (!parentElement) {
                    reject('Parent element of target div not found');
                    return;
                }

                const table = parentElement.querySelector('table.translation_table');
                if (!table) {
                    reject('Translation table not found in the parent element');
                    return;
                }

                const tbody = table.querySelector('tbody');
                const rows = tbody?.querySelectorAll('tr');
                if (rows) {
                    // 保留前5行
                    for (let i = 5; i < rows.length; i++) {
                        tbody?.removeChild(rows[i]);
                    }
                }

                resolve({ html: table.outerHTML });
            },
            onerror: function (error) {
                reject(`Error fetching translation table: ${error}`);
            }
        });
    });
}