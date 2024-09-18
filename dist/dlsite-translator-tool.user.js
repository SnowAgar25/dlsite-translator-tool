// ==UserScript==
// @name         DLsite 譯者工具 檢查作品翻譯狀態
// @namespace    https://github.com/SnowAgar25
// @version      3.1.1
// @author       SnowAgar25
// @description  當滑鼠對準任何含有RJ號href的物件時，將顯示一個預覽框，顯示翻譯報酬和申請情況
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dlsite.com
// @match        https://*.dlsite.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  function createPreviewBox() {
    const box = document.createElement("div");
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
  function calculatePosition(x, y, boxWidth, boxHeight) {
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
  function addNavLink(href, text, iconClass, iconContent) {
    const addNavItem = () => {
      const navList = document.querySelector(".floorSubNav-item > ul.headerNav");
      if (!navList) return;
      const newNavItem = document.createElement("li");
      newNavItem.className = "headerNav-item";
      const newLink = document.createElement("a");
      newLink.href = href;
      newLink.textContent = text;
      newLink.className = iconClass;
      newNavItem.appendChild(newLink);
      navList.appendChild(newNavItem);
    };
    addNavItem();
    if (!document.querySelector(".floorSubNav-item > ul.headerNav")) {
      const observer = new MutationObserver((_, obs) => {
        if (document.querySelector(".floorSubNav-item > ul.headerNav")) {
          addNavItem();
          obs.disconnect();
        }
      });
      const observeDOM = () => {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        } else {
          setTimeout(observeDOM, 10);
        }
      };
      observeDOM();
    }
    _GM_addStyle(`
    .headerNav .headerNav-item .${iconClass}::before {
      content: "${iconContent}";
    }
  `);
  }
  function addTranslationTableStyles() {
    _GM_addStyle(`
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
  async function fetchProductInfo(productId) {
    const url = `https://www.dlsite.com/maniax/product/info/ajax?product_id=${productId}&cdn_cache_min=1`;
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
        onload: function(response) {
          if (response.status === 200) {
            const data = JSON.parse(response.responseText);
            const productInfo = data[productId];
            if (productInfo) {
              resolve(productInfo);
            } else {
              reject("Product info not found");
            }
          } else {
            reject(`Failed to fetch product info: ${response.status}`);
          }
        },
        onerror: function(error) {
          reject(`Error fetching product info: ${error}`);
        }
      });
    });
  }
  async function fetchTranslationTable(productId, subDomain) {
    const url = `https://www.dlsite.com/${subDomain}/works/translatable/ajax?keyword=${productId}`;
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
        onload: function(response) {
          if (response.status === 200) {
            const data = JSON.parse(response.responseText);
            const searchResult = data.search_result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(searchResult, "text/html");
            const table = doc.querySelector("table.translation_table");
            if (table) {
              const tbody = table.querySelector("tbody");
              const rows = tbody == null ? void 0 : tbody.querySelectorAll("tr");
              if (rows) {
                for (let i = 5; i < rows.length; i++) {
                  tbody == null ? void 0 : tbody.removeChild(rows[i]);
                }
              }
              resolve({ html: table.outerHTML });
            } else {
              reject("Translation table not found");
            }
          } else {
            reject(`Failed to fetch translation table: ${response.status}`);
          }
        },
        onerror: function(error) {
          reject(`Error fetching translation table: ${error}`);
        }
      });
    });
  }
  const priceTable = [
    { 販売価格: 110, 卸価格: 53 },
    { 販売価格: 220, 卸価格: 107 },
    { 販売価格: 330, 卸価格: 161 },
    { 販売価格: 440, 卸価格: 215 },
    { 販売価格: 550, 卸価格: 269 },
    { 販売価格: 660, 卸価格: 323 },
    { 販売価格: 770, 卸価格: 431 },
    { 販売価格: 880, 卸価格: 485 },
    { 販売価格: 990, 卸価格: 539 },
    { 販売価格: 1100, 卸価格: 647 },
    { 販売価格: 1210, 卸価格: 754 },
    { 販売価格: 1320, 卸価格: 862 },
    { 販売価格: 1430, 卸価格: 970 },
    { 販売価格: 1540, 卸価格: 1024 },
    { 販売価格: 1650, 卸価格: 1078 },
    { 販売価格: 1760, 卸価格: 1186 },
    { 販売価格: 1870, 卸価格: 1294 },
    { 販売価格: 1980, 卸価格: 1401 },
    { 販売価格: 2090, 卸価格: 1509 },
    { 販売価格: 2200, 卸価格: 1563 },
    { 販売価格: 2310, 卸価格: 1617 },
    { 販売価格: 2420, 卸価格: 1725 },
    { 販売価格: 2530, 卸価格: 1833 },
    { 販売価格: 2640, 卸価格: 1941 },
    { 販売価格: 2750, 卸価格: 2049 },
    { 販売価格: 2860, 卸価格: 2102 },
    { 販売価格: 2970, 卸価格: 2156 },
    { 販売価格: 3080, 卸価格: 2264 },
    { 販売価格: 3190, 卸価格: 2372 },
    { 販売価格: 3300, 卸価格: 2480 },
    { 販売価格: 3410, 卸価格: 2588 },
    { 販売価格: 3520, 卸価格: 2642 },
    { 販売価格: 3630, 卸価格: 2696 },
    { 販売価格: 3740, 卸価格: 2803 },
    { 販売価格: 3850, 卸価格: 2911 },
    { 販売価格: 3960, 卸価格: 3019 },
    { 販売価格: 4070, 卸価格: 3127 },
    { 販売価格: 4180, 卸価格: 3235 },
    { 販売価格: 4290, 卸価格: 3343 }
  ];
  function getWholesalePrice(販売価格) {
    if (販売価格 >= 4400) {
      return Math.floor(販売価格 * 0.784);
    }
    const priceRow = priceTable.find((row) => row.販売価格 === 販売価格);
    return priceRow ? priceRow.卸価格 : null;
  }
  let previewBox = null;
  let isVisible = false;
  let hideTimeout = null;
  let currentProductId = null;
  let isFetching = false;
  let fetchingProductId = null;
  const productCache = {};
  function showPreviewBox(x, y) {
    if (!previewBox) return;
    clearTimeout(hideTimeout);
    previewBox.style.width = "auto";
    previewBox.style.height = "auto";
    const boxRect = previewBox.getBoundingClientRect();
    const { left, top } = calculatePosition(x, y, boxRect.width, boxRect.height);
    previewBox.style.left = `${left}px`;
    previewBox.style.top = `${top}px`;
    if (!isVisible) {
      isVisible = true;
      previewBox.style.opacity = "1";
      previewBox.style.display = "block";
    }
  }
  function hidePreviewBox() {
    if (isVisible && previewBox) {
      isVisible = false;
      previewBox.style.opacity = "0";
      hideTimeout = window.setTimeout(() => {
        if (previewBox) previewBox.style.display = "none";
        currentProductId = null;
        fetchingProductId = null;
      }, 300);
    }
  }
  async function handleMouseEnter(event) {
    var _a, _b;
    const target = event.target;
    const link = target.closest('a[href*="product_id/RJ"]');
    if (link instanceof HTMLAnchorElement) {
      link.removeAttribute("title");
      const productId = (_a = link.href.match(/product_id\/(\w+)/)) == null ? void 0 : _a[1];
      const subDomain = (_b = link.href.match(/dlsite\.com\/([^/]+)/)) == null ? void 0 : _b[1];
      if (productId && subDomain) {
        await fetchAndDisplayProductInfo(productId, event.clientX, event.clientY, subDomain);
      }
    }
  }
  async function fetchAndDisplayProductInfo(productId, x, y, subDomain) {
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
    if (previewBox) previewBox.innerHTML = "加載中...";
    try {
      isFetching = true;
      fetchingProductId = productId;
      const productInfo = await fetchProductInfo(productId);
      productCache[productId] = productInfo;
      if (currentProductId === productId) {
        displayProductInfo(productInfo, productId, x, y, subDomain);
      }
    } catch (error) {
      console.error("Error fetching product info:", error);
      if (previewBox && currentProductId === productId) previewBox.innerHTML = "加載失敗";
    } finally {
      isFetching = false;
      fetchingProductId = null;
    }
  }
  function displayProductInfo(info, productId, x, y, subDomain) {
    if (!previewBox || currentProductId !== productId) return;
    const translationInfo = info.translation_info;
    const content = [];
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
    previewBox.innerHTML = content.join("<br>");
    showPreviewBox(x, y);
    if (translationInfo.is_translation_agree) {
      if (productCache[productId].translationTable) {
        previewBox.innerHTML += "<br>" + productCache[productId].translationTable;
        showPreviewBox(x, y);
      } else {
        fetchTranslationTable(productId, subDomain).then((table) => {
          if (previewBox && currentProductId === productId) {
            previewBox.innerHTML += "<br>" + table.html;
            productCache[productId].translationTable = table.html;
            showPreviewBox(x, y);
          }
        }).catch((error) => {
          console.error("Error fetching translation table:", error);
        });
      }
    }
  }
  function initPreviewBox() {
    previewBox = createPreviewBox();
    document.body.addEventListener("mouseover", handleMouseEnter);
    document.body.addEventListener("mousemove", (e) => isVisible && showPreviewBox(e.clientX, e.clientY));
    document.body.addEventListener("mouseout", hidePreviewBox);
  }
  function init() {
    addTranslationTableStyles();
    initPreviewBox();
  }
  addNavLink("https://www.dlsite.com/maniax/works/translatable", "翻訳許可作品", "magnifying-glass", "\\f002");
  addNavLink("https://www.dlsite.com/translator/work", "翻訳申請", "translate-icon", "\\f1ab");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();