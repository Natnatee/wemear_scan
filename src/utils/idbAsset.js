const DB_NAME = "wemear-assets";
const STORE_NAME = "assets";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAsset(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAsset(url, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, url);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function fetchAndCacheAsset(url) {
  // ลองโหลดจาก IndexedDB ก่อน
  let data = await getAsset(url);
  if (data) {
    console.log(`Asset loaded from IndexedDB cache: ${url}`);
    return data;
  }

  // 2. ถ้าไม่มี โหลดจาก network แล้วเก็บ
  console.log(`Asset not found in cache, fetching from network: ${url}`);

  // ถ้าไม่มี โหลดจาก network แล้วเก็บ
  const res = await fetch(url);
  const blob = await res.blob();
  await saveAsset(url, blob);
  return blob;
}
