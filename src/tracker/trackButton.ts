const TRACKED_WORKS_KEY = 'dlsite_tracked_works';

interface TrackButtonData {
    productId: string;
    subdomain: string;
}

export function injectTrackButtons() {
    const workItems = document.querySelectorAll('dt.search_img.work_thumb');
    workItems.forEach((item) => {
        const linkElement = item.querySelector('a[href*="product_id/RJ"]');
        if (linkElement) {
            const href = linkElement.getAttribute('href');
            const match = href?.match(/\/(\w+)\/work\/=\/product_id\/(\w+)/);
            if (match) {
                const [, subdomain, productId] = match;
                const button = createTrackButton({ productId, subdomain });
                item.insertBefore(button, item.firstChild);
            }
        }
    });

    // 添加全局樣式
    const style = document.createElement('style');
    style.textContent = `
        .track-button {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 40px;
            height: 40px;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 12px;
            cursor: pointer;
            z-index: 1;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
        }
        .track-button:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .track-button.tracked {
            background-color: #f44336;
        }
        .track-button.untracked {
            background-color: rgba(76, 175, 80, 0.8);
        }
        @keyframes trackSuccess {
            0% { background-color: rgba(76, 175, 80, 0.8); }
            100% { background-color: #f44336; }
        }
        .track-button.tracking {
            animation: trackSuccess 0.5s forwards;
        }
        .search_img.work_thumb {
            position: relative;
        }
        .search_img.work_thumb > a,
        .search_img.work_thumb > a > img {
            pointer-events: none;
        }
        .search_img.work_thumb:hover > a,
        .search_img.work_thumb:hover > a > img {
            pointer-events: auto;
        }
        .track-button-active .work_img_popover {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

function createTrackButton(data: TrackButtonData): HTMLButtonElement {
    const button = document.createElement('button');
    const isTracked = isWorkTracked(data);

    button.className = `track-button ${isTracked ? 'tracked' : 'untracked'}`;
    button.textContent = isTracked ? '取消' : '追蹤';
    button.dataset.productId = data.productId;
    button.dataset.subdomain = data.subdomain;

    button.addEventListener('click', handleTrackButtonClick);
    button.addEventListener('mouseenter', handleButtonMouseEnter);
    button.addEventListener('mouseleave', handleButtonMouseLeave);
    return button;
}

function handleButtonMouseEnter(event: MouseEvent) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLButtonElement;
    const workThumb = button.closest('.search_img.work_thumb');
    if (workThumb) {
        workThumb.classList.add('track-button-active');
    }
}

function handleButtonMouseLeave(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    const workThumb = button.closest('.search_img.work_thumb');
    if (workThumb) {
        workThumb.classList.remove('track-button-active');
    }
}

function isWorkTracked(data: TrackButtonData): boolean {
    const trackedWorks = getTrackedWorks();
    return Object.values(trackedWorks).some(list => list.includes(data.productId));
}

function handleTrackButtonClick(event: MouseEvent) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLButtonElement;
    const { productId, subdomain } = button.dataset;

    if (productId && subdomain) {
        const isCurrentlyTracked = button.classList.contains('tracked');

        if (isCurrentlyTracked) {
            removeFromTrackedWorks(productId);
            button.textContent = '追蹤';
            button.classList.remove('tracked', 'tracking');
            button.classList.add('untracked');
        } else {
            addToTrackedWorks(productId, subdomain);
            button.textContent = '取消';
            button.classList.remove('untracked');
            button.classList.add('tracking');
            setTimeout(() => {
                button.classList.remove('tracking');
                button.classList.add('tracked');
            }, 500);
        }
    }
}

function addToTrackedWorks(productId: string, subdomain: string) {
    const trackedWorks = getTrackedWorks();
    if (!trackedWorks[subdomain]) {
        trackedWorks[subdomain] = [];
    }
    if (!trackedWorks[subdomain].includes(productId)) {
        trackedWorks[subdomain].push(productId);
        localStorage.setItem(TRACKED_WORKS_KEY, JSON.stringify(trackedWorks));
    }
}

function removeFromTrackedWorks(productId: string) {
    const trackedWorks = getTrackedWorks();
    for (const subdomain in trackedWorks) {
        const index = trackedWorks[subdomain].indexOf(productId);
        if (index !== -1) {
            trackedWorks[subdomain].splice(index, 1);
            if (trackedWorks[subdomain].length === 0) {
                delete trackedWorks[subdomain];
            }
            localStorage.setItem(TRACKED_WORKS_KEY, JSON.stringify(trackedWorks));
            break;
        }
    }
}

function getTrackedWorks(): { [subdomain: string]: string[] } {
    const trackedWorksJson = localStorage.getItem(TRACKED_WORKS_KEY);
    return trackedWorksJson ? JSON.parse(trackedWorksJson) : {};
}