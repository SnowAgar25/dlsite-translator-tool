// tracker/indexedDB.ts

export const DB_NAME = 'DLSiteCache';
export const STORE_NAME = 'pages';
export const CACHE_KEY = 'dlsite_translatable_cache';

export async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject("Error opening database");
        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        };
    });
}

export async function saveToIndexedDB(key: string, data: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ key, value: data });
        request.onerror = () => reject("Error saving to IndexedDB");
        request.onsuccess = () => resolve();
    });
}

export async function getFromIndexedDB(key: string): Promise<string | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onerror = () => reject("Error getting from IndexedDB");
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
    });
}

export async function clearFromIndexedDB(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onerror = () => reject("Error clearing from IndexedDB");
        request.onsuccess = () => resolve();
    });
}