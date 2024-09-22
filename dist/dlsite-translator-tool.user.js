// ==UserScript==
// @name         DLsite 譯者工具 檢查作品翻譯狀態
// @namespace    https://github.com/SnowAgar25
// @version      3.1.2
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
          if (response.status !== 200) {
            reject(`Failed to fetch translation table: ${response.status}`);
            return;
          }
          const data = JSON.parse(response.responseText);
          const searchResult = data.search_result;
          const parser = new DOMParser();
          const doc = parser.parseFromString(searchResult, "text/html");
          const targetDiv = doc.querySelector(`li.search_result_img_box_inner > div[data-product_id="${productId}"]`);
          if (!targetDiv) {
            reject(`Div with data-product_id="${productId}" not found`);
            return;
          }
          const parentElement = targetDiv.parentElement;
          if (!parentElement) {
            reject("Parent element of target div not found");
            return;
          }
          const table = parentElement.querySelector("table.translation_table");
          if (!table) {
            reject("Translation table not found in the parent element");
            return;
          }
          const tbody = table.querySelector("tbody");
          const rows = tbody == null ? void 0 : tbody.querySelectorAll("tr");
          if (rows) {
            for (let i = 5; i < rows.length; i++) {
              tbody == null ? void 0 : tbody.removeChild(rows[i]);
            }
          }
          resolve({ html: table.outerHTML });
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
  function initCustomNavLinks() {
    var _a;
    const subdomain = (_a = window.location.href.match(/dlsite\.com\/(\w+)/)) == null ? void 0 : _a[1];
    addNavLink(`https://www.dlsite.com/${subdomain}/works/translatable`, "翻訳許可作品", "magnifying-glass", "\\f002");
    addNavLink("https://www.dlsite.com/translator/work", "翻訳申請", "translate-icon", "\\f1ab");
  }
  const DB_NAME = "DLSiteCache";
  const STORE_NAME = "pages";
  const CACHE_KEY = "dlsite_translatable_cache";
  async function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject("Error opening database");
      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
    });
  }
  async function saveToIndexedDB(key, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, value: data });
      request.onerror = () => reject("Error saving to IndexedDB");
      request.onsuccess = () => resolve();
    });
  }
  async function getFromIndexedDB(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onerror = () => reject("Error getting from IndexedDB");
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
    });
  }
  async function clearFromIndexedDB(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onerror = () => reject("Error clearing from IndexedDB");
      request.onsuccess = () => resolve();
    });
  }
  function modifyPage(doc) {
    try {
      const styleElement = document.createElement("style");
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

            #main_inner {
                margin: 1% 5%;
            }
        `;
      let head = doc.querySelector("head");
      if (!head) {
        head = doc.createElement("head");
        doc.insertBefore(head, doc.firstChild);
      }
      head.appendChild(styleElement);
      const main_inner = doc.querySelector("#main > #main_inner");
      if (main_inner) {
        main_inner.style.margin = "1% 5%";
      }
      const searchResultList = doc.querySelector("#search_result_list");
      if (searchResultList) {
        searchResultList.style.display = "flex";
        searchResultList.style.justifyContent = "center";
        searchResultList.style.alignItems = "center";
        searchResultList.style.minHeight = "300px";
      }
      const mainModifyBox = doc.querySelector("#search_result_list > .main_modify_box");
      if (mainModifyBox) {
        mainModifyBox.style.width = "100%";
        mainModifyBox.style.maxWidth = "800px";
      }
      const heading = doc.querySelector(".cp_overview_inner > .heading");
      if (heading) {
        heading.innerHTML = "關於追蹤列表";
      }
      const listItems = doc.querySelectorAll(".cp_overview_list_item");
      const newContents = [
        {
          heading: "添加追蹤",
          content: "只需點擊追蹤按鈕，即可將作品添加至您的個人追蹤列表。"
        },
        {
          heading: "自動更新",
          content: "Dlsite和插件開啟時，每30分鐘自動檢查並更新追蹤作品的翻譯狀態，無需手動操作。"
        },
        {
          heading: "全類型支持",
          content: "支持多種類型作品，讓您輕鬆追蹤所有感興趣的可翻譯內容。"
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
      const floorTabItems = doc.querySelectorAll(".floorTab-item");
      floorTabItems.forEach((item) => {
        item.classList.remove("is-active");
      });
      const btnBox = doc.querySelector(".cp_overview_btn_box");
      if (btnBox) {
        btnBox.remove();
      }
    } catch (error) {
      console.error("修改頁面時出錯:", error);
      throw error;
    }
  }
  async function search(subdomain, keywords) {
    try {
      const keywordString = keywords.join("|");
      const params = new URLSearchParams({ keyword: keywordString, page: "1" });
      const endpoint = `https://www.dlsite.com/${subdomain}/works/translatable/ajax`;
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error(`搜索出錯 (${subdomain}, ${keywords.join(", ")}):`, error);
      return null;
    }
  }
  function processSearchResults(results, keywords) {
    const parser = new DOMParser();
    const processedResults = [];
    let totalCount = 0;
    const keywordSet = new Set(keywords.map((kw) => kw.toUpperCase()));
    results.forEach((result) => {
      if (result && result.search_result) {
        const doc = parser.parseFromString(result.search_result, "text/html");
        const items = doc.querySelectorAll("li.search_result_img_box_inner");
        items.forEach((item) => {
          const productIdElement = item.querySelector("div[data-product_id]");
          if (productIdElement) {
            const productId = productIdElement.dataset.product_id;
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
  function updatePage(processedResults, totalCount) {
    const container = document.querySelector("#search_result_list");
    if (container) {
      container.className = "_search_result_list";
      const ul = document.createElement("ul");
      ul.id = "search_result_img_box";
      ul.className = "n_worklist";
      ul.innerHTML = processedResults.join("");
      container.innerHTML = "";
      container.appendChild(ul);
    } else {
      console.error("未找到搜索結果容器");
    }
    const headerContainer = document.querySelector("._scroll_position");
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
    console.log("頁面已更新");
  }
  function createButtons() {
    const navList = document.querySelector("ul.floorTab");
    if (navList) {
      const cacheButtonLi = document.createElement("li");
      cacheButtonLi.className = "floorTab-item type-cache";
      cacheButtonLi.innerHTML = '<a href="#">追蹤列表</a>';
      const clearCacheButtonLi = document.createElement("li");
      clearCacheButtonLi.className = "floorTab-item type-clear-cache";
      clearCacheButtonLi.innerHTML = '<a href="#">清除緩存</a>';
      navList.appendChild(cacheButtonLi);
      navList.appendChild(clearCacheButtonLi);
    }
  }
  function toTracklist() {
    const newUrl = `https://www.dlsite.com/home/?tracklist=true`;
    window.location.href = newUrl;
  }
  function addButtonListeners() {
    const cacheButton = document.querySelector(".floorTab-item.type-cache a");
    const clearCacheButton = document.querySelector(".floorTab-item.type-clear-cache a");
    if (cacheButton) {
      cacheButton.addEventListener("click", function(e) {
        e.preventDefault();
        toTracklist();
      });
    }
    if (clearCacheButton) {
      clearCacheButton.addEventListener("click", function(e) {
        e.preventDefault();
        clearCache();
      });
    }
  }
  const DLSITE_THEME = "girls";
  const BASE_URL = `https://www.dlsite.com/${DLSITE_THEME}/works/translatable`;
  const TARGET_URL = `${BASE_URL}?keyword=%F0%9F%A5%B0`;
  async function fetchAndCachePage() {
    try {
      const response = await fetch(TARGET_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      modifyPage(doc);
      const serializer = new XMLSerializer();
      const modifiedHtml = serializer.serializeToString(doc);
      await saveToIndexedDB(CACHE_KEY, modifiedHtml);
      return modifiedHtml;
    } catch (error) {
      console.error("獲取或緩存頁面時出錯:", error);
      return null;
    }
  }
  async function showCachedPage() {
    try {
      let cachedHtml = await getFromIndexedDB(CACHE_KEY);
      if (!cachedHtml) {
        cachedHtml = await fetchAndCachePage();
      }
      if (cachedHtml) {
        if (!document.body) {
          document.body = document.createElement("body");
        }
        document.body.innerHTML = cachedHtml;
        createButtons();
        addButtonListeners();
        performSearchAndUpdate();
      } else {
        throw new Error("無法顯示緩存頁面");
      }
    } catch (error) {
      console.error("顯示緩存頁面時出錯:", error);
      try {
        const newCachedHtml = await fetchAndCachePage();
        if (newCachedHtml) {
          showCachedPage();
        } else {
          throw new Error("無法獲取新的頁面內容");
        }
      } catch (fetchError) {
        console.error("重新獲取頁面失敗:", fetchError);
        alert("無法獲取或顯示頁面，請稍後再試。");
      }
    }
  }
  async function clearCache() {
    try {
      await clearFromIndexedDB(CACHE_KEY);
      alert(`緩存已清除`);
    } catch (error) {
      console.error("清除緩存時出錯:", error);
      alert("清除緩存失敗，請稍後再試。");
    }
  }
  async function performSearchAndUpdate() {
    const searchParams = {
      "maniax": ["RJ01248548", "RJ01217348", "RJ01248996", "RJ01234443", "RJ01255148", "RJ01248548", "RJ01251469", "RJ01238176", "RJ01221693", "RJ01246834", "RJ01242051", "RJ01241016", "RJ01240596", "RJ01217348"],
      "girls": ["RJ01254876", "RJ01251876"]
    };
    const searchPromises = Object.entries(searchParams).map(([subdomain, keywords]) => {
      console.log(`搜索 ${subdomain}: ${keywords.join(", ")} 中...`);
      return search(subdomain, keywords);
    });
    const results = await Promise.all(searchPromises);
    const validResults = results.filter((result) => result !== null);
    if (validResults.length > 0) {
      const allKeywords = Object.values(searchParams).flat();
      const { processedResults, totalCount } = processSearchResults(validResults, allKeywords);
      console.log("處理後的搜索結果數量:", processedResults.length);
      updatePage(processedResults, totalCount);
    } else {
      console.log("所有搜索均未找到結果");
      updatePage([], 0);
    }
  }
  function initTracker() {
    createButtons();
    addButtonListeners();
  }
  const isTracklist = window.location.href.includes("?tracklist=true");
  if (isTracklist) {
    showCachedPage();
  } else {
    initCustomNavLinks();
    const init = () => {
      addTranslationTableStyles();
      initPreviewBox();
      initTracker();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

})();