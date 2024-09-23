import { injectTrackButtons } from './trackButton';

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function initTrackButtonHandler() {
    console.log('初始化 DLsite 追蹤器');

    const debouncedInjectButtons = debounce(() => {
        console.log('搜索結果容器發生變化，注入追蹤按鈕');
        injectTrackButtons();
    }, 300);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                debouncedInjectButtons();
            }
        });
    });

    const config: MutationObserverInit = { childList: true };

    function startObserving() {
        const targetNode = document.querySelector('._search_result_container');
        if (targetNode) {
            observer.observe(targetNode, config);
            console.log('開始監視搜索結果容器');
        } else {
            console.log('未找到搜索結果容器，稍後重試');
            setTimeout(startObserving, 1000);
        }
    }

    // 頁面加載完成後開始觀察
    window.addEventListener('load', startObserving);
}