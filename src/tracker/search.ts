// tracker/search.ts

export async function search(subdomain: string, keywords: string[]): Promise<any> {
    try {
        const keywordString = keywords.join('|');
        const params = new URLSearchParams({ keyword: keywordString, page: '1' });
        const endpoint = `https://www.dlsite.com/${subdomain}/works/translatable/ajax`;
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`搜索出錯 (${subdomain}, ${keywords.join(', ')}):`, error);
        return null;
    }
}

export function processSearchResults(results: any[], keywords: string[]): { processedResults: string[], totalCount: number } {
    const parser = new DOMParser();
    const processedResults: string[] = [];
    let totalCount = 0;

    const keywordSet = new Set(keywords.map(kw => kw.toUpperCase()));

    results.forEach(result => {
        if (result && result.search_result) {
            const doc = parser.parseFromString(result.search_result, 'text/html');
            const items = doc.querySelectorAll('li.search_result_img_box_inner');
            items.forEach(item => {
                const productIdElement = item.querySelector('div[data-product_id]') as HTMLElement | null;
                if (productIdElement) {
                    const productId = productIdElement.dataset.product_id as string;
                    if (keywordSet.has(productId.toUpperCase())) {
                        processedResults.push(item.outerHTML);
                        totalCount++;
                    }
                }
            });
        }
    });

    return { processedResults, totalCount };
}

export function updatePage(processedResults: string[], totalCount: number): void {
    const container = document.querySelector('#search_result_list') as HTMLElement | null;
    if (container) {
        container.className = '_search_result_list';
        const ul = document.createElement('ul');
        ul.id = 'search_result_img_box';
        ul.className = 'n_worklist';
        ul.innerHTML = processedResults.join('');
        container.innerHTML = '';
        container.appendChild(ul);
    } else {
        console.error('未找到搜索結果容器');
    }

    const headerContainer = document.querySelector('._scroll_position') as HTMLElement | null;
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="cp_heading type_game type_result">
                <h2 class="cp_heading_inner">追蹤列表🥰</h2>
                <div class="cp_result_count">
                    ${totalCount}<span>件中</span>
                    1～${totalCount}
                    <span>件目</span>
                </div>
            </div>
        `;
    }

    console.log('頁面已更新');
}