// tracker/pageModifier.ts

export function modifyPage(doc: Document): void {
    try {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .custom-button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.3s;
            }
            .custom-button:hover {
                background-color: #45a049;
            }
            .clear-button {
                background-color: #f44336;
            }
            .clear-button:hover {
                background-color: #da190b;
            }
            #search_result_list {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 300px;
            }
            #search_result_list > .main_modify_box {
                width: 100%;
                max-width: 800px;
            }
        `;

        let head = doc.querySelector('head');
        if (!head) {
            head = doc.createElement('head');
            doc.insertBefore(head, doc.firstChild);
        }
        head.appendChild(styleElement);

        const searchResultList = doc.querySelector('#search_result_list') as HTMLElement | null;
        if (searchResultList) {
            searchResultList.style.display = 'flex';
            searchResultList.style.justifyContent = 'center';
            searchResultList.style.alignItems = 'center';
            searchResultList.style.minHeight = '300px';
        }

        const mainModifyBox = doc.querySelector('#search_result_list > .main_modify_box') as HTMLElement | null;
        if (mainModifyBox) {
            mainModifyBox.style.width = '100%';
            mainModifyBox.style.maxWidth = '800px';
        }

        const listItems = doc.querySelectorAll('.cp_overview_list_item');
        const newContents = [
            {
                heading: '翻譯獎勵',
                content: '翻譯獎勵是一個激勵機制，旨在鼓勵高質量的翻譯工作。獎勵金額根據作品的受歡迎程度和翻譯品質而定。'
            },
            {
                heading: '翻譯指南',
                content: '我們提供詳細的翻譯指南，幫助譯者理解和遵循我們的翻譯標準。這包括術語表、風格指南和品質檢查清單。'
            },
            {
                heading: '申請流程',
                content: '申請翻譯項目很簡單。選擇你感興趣的作品，提交一個簡短的翻譯樣本，然後等待審核。我們會在7個工作日內給予回覆。'
            }
        ];

        listItems.forEach((item, index) => {
            if (index < newContents.length) {
                item.innerHTML = `
                    <h3 class="heading">${newContents[index].heading}</h3>
                    <p>${newContents[index].content}</p>
                `;
            }
        });

        const btnBox = doc.querySelector('.cp_overview_btn_box');
        if (btnBox) {
            btnBox.remove();
        }

    } catch (error) {
        console.error('修改頁面時出錯:', error);
        throw error;
    }
}