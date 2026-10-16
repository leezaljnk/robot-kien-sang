/**
 * persistentStorage.ts
 * Quản lý lưu trữ bền vững cho hình ảnh (Trang phục Kiến Sáng, 16 ảnh rác, thùng rác, giọng nói).
 * Sử dụng IndexedDB để không bị giới hạn 5MB quota của localStorage (tránh bị mất ảnh sau khi sửa code hoặc reload).
 * Tự động tối ưu dung lượng ảnh (Canvas resize) để tải siêu nhanh.
 */

const DB_NAME = 'kien_sang_app_db_v2';
const DB_VERSION = 1;
const STORE_NAME = 'app_keyval';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        console.warn('IndexedDB open error, will fallback to localStorage');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

/**
 * Lưu một giá trị vào IndexedDB (kèm fallback localStorage)
 */
export async function setPersistentItem<T>(key: string, value: T): Promise<void> {
  // 1. Thử lưu vào localStorage trước nếu có thể
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (_e) {
    // Nếu vượt quota localStorage (thường là 5MB), IndexedDB sẽ gánh
  }

  // 2. Lưu vào IndexedDB để bảo toàn tuyệt đối không bao giờ bị mất
  try {
    const db = await openDatabase();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        } catch (err) {
          reject(err);
        }
      });
    }
  } catch (err) {
    console.warn('IndexedDB write error for key:', key, err);
  }
}

/**
 * Đọc giá trị từ IndexedDB trước, nếu không có đọc tiếp localStorage
 */
export async function getPersistentItem<T>(key: string, defaultValue: T): Promise<T> {
  // 1. Thử lấy từ IndexedDB
  try {
    const db = await openDatabase();
    if (db) {
      const val = await new Promise<T | undefined>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });
      if (val !== undefined && val !== null) {
        return val;
      }
    }
  } catch {
    // fallback
  }

  // 2. Fallback sang localStorage nếu IndexedDB chưa có
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Đồng bộ ngược lại IndexedDB để lần sau đọc nhanh
      setPersistentItem(key, parsed).catch(() => {});
      return parsed;
    }
  } catch {
    // ignore
  }

  return defaultValue;
}

/**
 * Xóa một mục lưu trữ
 */
export async function removePersistentItem(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {}

  try {
    const db = await openDatabase();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  } catch {}
}

/**
 * Tối ưu nén ảnh dataURL (tự động resize về kích thước chuẩn tối đa 400x400 để giảm 90% dung lượng)
 */
export function compressImageDataUrl(dataUrl: string, maxDim = 400, quality = 0.9): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= maxDim && height <= maxDim) {
          resolve(dataUrl);
          return;
        }

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Lưu dạng PNG nếu có nền trong suốt, hoặc WebP/PNG
        const compressed = canvas.toDataURL('image/png', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
