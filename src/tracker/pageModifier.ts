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
            #main_inner {
                margin: 1% 5%;
            }
        `;

        let head = doc.querySelector('head');
        if (!head) {
            head = doc.createElement('head');
            doc.insertBefore(head, doc.firstChild);
        }
        head.appendChild(styleElement);

        const main_inner = doc.querySelector('#main > #main_inner') as HTMLElement | null;
        if (main_inner) {
            main_inner.style.margin = '1% 5%';
        }

        const heading = doc.querySelector('.cp_overview_inner > .heading') as HTMLElement | null;
        if (heading) {
            heading.innerHTML = '關於追蹤列表';
        }

        const listItems = doc.querySelectorAll('.cp_overview_list_item');
        const newContents = [
            {
                heading: '添加追蹤',
                content: '只需點擊追蹤按鈕，即可將作品添加至您的個人追蹤列表。'
            },
            {
                heading: '自動更新',
                content: 'Dlsite和插件開啟時，每30分鐘自動檢查並更新追蹤作品的翻譯狀態。<br>（尚未實現）'
            },
            {
                heading: '全類型支持',
                content: '支持多種類型作品，讓您輕鬆追蹤所有感興趣的可翻譯內容。'
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

        const floorTabItems = doc.querySelectorAll('.floorTab-item');
        floorTabItems.forEach((item) => {
            item.classList.remove('is-active');
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
