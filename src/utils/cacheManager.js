// ============================================================================
// cacheManager.js - IndexedDB cache system for thumbnails and images
// ============================================================================

const DB_NAME = 'PhotoVaultCache';
const DB_VERSION = 1;
const STORES = {
  THUMBNAILS: 'thumbnails',
  IMAGES: 'images',
  METADATA: 'metadata'
};

// Cache expiration time (7 days)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * Initialize IndexedDB
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.THUMBNAILS)) {
        const thumbStore = db.createObjectStore(STORES.THUMBNAILS, { keyPath: 'id' });
        thumbStore.createIndex('photoId', 'photoId', { unique: false });
        thumbStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.IMAGES)) {
        const imgStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
        imgStore.createIndex('url', 'url', { unique: true });
        imgStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Save thumbnail to cache
 * @param {string} photoId - Photo ID
 * @param {string} size - Thumbnail size (small/medium)
 * @param {Blob} blob - Thumbnail blob
 * @returns {Promise<void>}
 */
export async function cacheThumbnail(photoId, size, blob) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.THUMBNAILS], 'readwrite');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    
    const id = `${photoId}_${size}`;
    const data = {
      id,
      photoId,
      size,
      blob,
      timestamp: Date.now()
    };
    
    await new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('🔥 Cache thumbnail failed:', error);
  }
}

/**
 * Get thumbnail from cache
 * @param {string} photoId - Photo ID
 * @param {string} size - Thumbnail size
 * @returns {Promise<Blob|null>}
 */
export async function getCachedThumbnail(photoId, size) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.THUMBNAILS], 'readonly');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    
    const id = `${photoId}_${size}`;
    
    const data = await new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    if (!data) return null;
    
    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      await deleteCachedThumbnail(photoId, size);
      return null;
    }
    
    return data.blob;
  } catch (error) {
    console.error('🔥 Get cached thumbnail failed:', error);
    return null;
  }
}

/**
 * Delete thumbnail from cache
 * @param {string} photoId - Photo ID
 * @param {string} size - Thumbnail size
 * @returns {Promise<void>}
 */
export async function deleteCachedThumbnail(photoId, size) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.THUMBNAILS], 'readwrite');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    
    const id = `${photoId}_${size}`;
    
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('🔥 Delete cached thumbnail failed:', error);
  }
}

/**
 * Cache full image
 * @param {string} url - Image URL
 * @param {Blob} blob - Image blob
 * @returns {Promise<void>}
 */
export async function cacheImage(url, blob) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.IMAGES], 'readwrite');
    const store = transaction.objectStore(STORES.IMAGES);
    
    const data = {
      id: url,
      url,
      blob,
      timestamp: Date.now()
    };
    
    await new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('🔥 Cache image failed:', error);
  }
}

/**
 * Get cached image
 * @param {string} url - Image URL
 * @returns {Promise<Blob|null>}
 */
export async function getCachedImage(url) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.IMAGES], 'readonly');
    const store = transaction.objectStore(STORES.IMAGES);
    
    const data = await new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    if (!data) return null;
    
    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      await deleteCachedImage(url);
      return null;
    }
    
    return data.blob;
  } catch (error) {
    console.error('🔥 Get cached image failed:', error);
    return null;
  }
}

/**
 * Delete cached image
 * @param {string} url - Image URL
 * @returns {Promise<void>}
 */
export async function deleteCachedImage(url) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.IMAGES], 'readwrite');
    const store = transaction.objectStore(STORES.IMAGES);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('🔥 Delete cached image failed:', error);
  }
}

/**
 * Clear all expired cache entries
 * @returns {Promise<Object>} Stats about cleared entries
 */
export async function clearExpiredCache() {
  try {
    const db = await initDB();
    const now = Date.now();
    let deletedCount = 0;
    
    // Clear expired thumbnails
    const thumbTransaction = db.transaction([STORES.THUMBNAILS], 'readwrite');
    const thumbStore = thumbTransaction.objectStore(STORES.THUMBNAILS);
    const thumbIndex = thumbStore.index('timestamp');
    
    const thumbCursor = thumbIndex.openCursor();
    
    await new Promise((resolve) => {
      thumbCursor.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (now - cursor.value.timestamp > CACHE_EXPIRY) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
    
    // Clear expired images
    const imgTransaction = db.transaction([STORES.IMAGES], 'readwrite');
    const imgStore = imgTransaction.objectStore(STORES.IMAGES);
    const imgIndex = imgStore.index('timestamp');
    
    const imgCursor = imgIndex.openCursor();
    
    await new Promise((resolve) => {
      imgCursor.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (now - cursor.value.timestamp > CACHE_EXPIRY) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
    
    db.close();
    
    console.log(`🧹 Cleared ${deletedCount} expired cache entries`);
    
    return { deletedCount };
  } catch (error) {
    console.error('🔥 Clear expired cache failed:', error);
    return { deletedCount: 0, error };
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache stats
 */
export async function getCacheStats() {
  try {
    const db = await initDB();
    
    const thumbTransaction = db.transaction([STORES.THUMBNAILS], 'readonly');
    const thumbStore = thumbTransaction.objectStore(STORES.THUMBNAILS);
    
    const thumbCount = await new Promise((resolve, reject) => {
      const request = thumbStore.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const imgTransaction = db.transaction([STORES.IMAGES], 'readonly');
    const imgStore = imgTransaction.objectStore(STORES.IMAGES);
    
    const imgCount = await new Promise((resolve, reject) => {
      const request = imgStore.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    return {
      thumbnails: thumbCount,
      images: imgCount,
      total: thumbCount + imgCount
    };
  } catch (error) {
    console.error('🔥 Get cache stats failed:', error);
    return { thumbnails: 0, images: 0, total: 0 };
  }
}

/**
 * Clear all cache
 * @returns {Promise<void>}
 */
export async function clearAllCache() {
  try {
    const db = await initDB();
    
    const thumbTransaction = db.transaction([STORES.THUMBNAILS], 'readwrite');
    await new Promise((resolve, reject) => {
      const request = thumbTransaction.objectStore(STORES.THUMBNAILS).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    const imgTransaction = db.transaction([STORES.IMAGES], 'readwrite');
    await new Promise((resolve, reject) => {
      const request = imgTransaction.objectStore(STORES.IMAGES).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    console.log('🧹 All cache cleared');
  } catch (error) {
    console.error('🔥 Clear all cache failed:', error);
  }
}

// Auto-cleanup expired cache on initialization
clearExpiredCache();
