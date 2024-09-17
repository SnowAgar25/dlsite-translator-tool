import { GM_addStyle } from '$';

export function createPreviewBox(): HTMLDivElement {
    const box = document.createElement('div');
    box.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    font-size: 14px;
    line-height: 1.4;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  `;
    document.body.appendChild(box);
    return box;
}

export function calculatePosition(x: number, y: number, boxWidth: number, boxHeight: number): { left: number; top: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x + 15;
    let top = y + 15;

    if (left + boxWidth > viewportWidth) {
        left = x - boxWidth - 15;
    }

    if (top + boxHeight > viewportHeight) {
        top = y - boxHeight - 15;
    }

    left = Math.max(10, left);
    top = Math.max(10, top);

    return { left, top };
}

export function addNavLink(href: string, text: string, iconClass: string, iconContent: string): void {
    const navList = document.querySelector('.floorSubNav-item > ul.headerNav');
    if (!navList) return;

    const newNavItem = document.createElement('li');
    newNavItem.className = 'headerNav-item';

    const newLink = document.createElement('a');
    newLink.href = href;
    newLink.textContent = text;
    newLink.className = iconClass;

    newNavItem.appendChild(newLink);
    navList.appendChild(newNavItem);

    GM_addStyle(`
    .headerNav .headerNav-item .${iconClass}::before {
      content: "${iconContent}";
    }
  `);
}

export function addTranslationTableStyles(): void {
    GM_addStyle(`
        .translation_table {
            border-collapse: separate;
            font-size: 12px;
            white-space: nowrap;
        }
        .translation_table th {
            padding: 8px;
            min-width: 70px;
            color: #536280;
            background: #e6eaf2;
            text-align: center;
            border: solid 1px #fff;
        }
        .translation_table td {
            padding: 5px 3px;
            text-align: center;
            vertical-align: middle;
        }
        .translation_table tr:not(:nth-child(-n+2)) td {
            border-top: solid 1px #e6eaf2;
        }
        .translation_table td strong {
            font-size: 1.2em;
            padding-right: 2px;
            color: #56c323;
        }
        .translation_table .date {
            font-size: 12px;
        }
    `);
}