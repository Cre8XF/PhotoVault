// ============================================================================
// PhotoVault Local Cache – IndexedDB for album, bilder og sikkerhet
// v4.0 – FASE 3: Sikkerhet & Privacy
// ============================================================================

const DB_NAME = "PhotoVaultDB";
const DB_VERSION = 4; // Updated for FASE 3

const STORES = {
  albums: { keyPath: "id" },
  photos: { keyPath: "id" },
  security: { keyPath: "key" }, // NEW - Security settings and encrypted data
};

// ---------- Åpne eller opprett database ----------
export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      Object.entries(STORES).forEach(([name, cfg]) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, cfg);
        }
      });

      // Fjern eventuelle gamle tabeller
      const toRemove = [...db.objectStoreNames].filter(
        (n) => !Object.keys(STORES).includes(n)
      );
      toRemove.forEach((name) => db.deleteObjectStore(name));
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

// ---------- Generell transaksjonshjelper ----------
async function withStore(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const st = tx.objectStore(store);
    const req = fn(st);
    tx.oncomplete = () => resolve(req);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ============================================================================
// GRUNNLEGGENDE OPERASJONER
// ============================================================================

export async function put(store, obj) {
  if (!obj) return;
  return withStore(store, "readwrite", (st) => st.put(obj));
}

export async function bulkPut(store, arr) {
  if (!Array.isArray(arr)) return;
  return withStore(store, "readwrite", (st) => {
    arr.forEach((o) => st.put(o));
  });
}

export async function getAll(store) {
  return withStore(store, "readonly", (st) => {
    return new Promise((res) => {
      const req = st.getAll();
      req.onsuccess = () => res(req.result || []);
    });
  });
}

export async function get(store, key) {
  return withStore(store, "readonly", (st) => {
    return new Promise((res) => {
      const req = st.get(key);
      req.onsuccess = () => res(req.result);
    });
  });
}

export async function del(store, key) {
  if (!key) return;
  return withStore(store, "readwrite", (st) => st.delete(key));
}

export async function clear(store) {
  return withStore(store, "readwrite", (st) => st.clear());
}

// ============================================================================
// EKSTRA FUNKSJONER
// ============================================================================

// Filtrering basert på betingelse
export async function filter(store, predicate) {
  const all = await getAll(store);
  return all.filter(predicate);
}

// Slett alle rader som matcher et felt
export async function delWhere(store, field, value) {
  const all = await getAll(store);
  const toDelete = all.filter((item) => item[field] === value);
  for (const item of toDelete) await del(store, item[STORES[store].keyPath]);
  console.info(`🗑️  Slettet ${toDelete.length} elementer fra ${store}`);
  return toDelete.length;
}

// Teller antall elementer
export async function count(store) {
  return withStore(store, "readonly", (st) => {
    return new Promise((res) => {
      const req = st.count();
      req.onsuccess = () => res(req.result);
    });
  });
}

// ============================================================================
// FOTO-SPESIFIKKE FUNKSJONER
// ============================================================================

// Hent bilder uten album
export async function getUnsortedPhotos() {
  const allPhotos = await getAll("photos");
  return allPhotos.filter((p) => !p.albumId);
}

// ============================================================================
// SIKKERHET-SPESIFIKKE FUNKSJONER (FASE 3)
// ============================================================================

/**
 * Lagre sikkerhetsnøkkel
 * @param {string} key - Nøkkel-ID
 * @param {any} value - Verdi som skal lagres
 */
export async function setSecurityKey(key, value) {
  return put("security", { key, value, updatedAt: Date.now() });
}

/**
 * Hent sikkerhetsnøkkel
 * @param {string} key - Nøkkel-ID
 * @returns {Promise<any>} - Verdien eller null
 */
export async function getSecurityKey(key) {
  const result = await get("security", key);
  return result ? result.value : null;
}

/**
 * Slett sikkerhetsnøkkel
 * @param {string} key - Nøkkel-ID
 */
export async function deleteSecurityKey(key) {
  return del("security", key);
}

/**
 * Lagre kryptert foto-data
 * @param {string} photoId - Foto-ID
 * @param {string} encryptedData - Kryptert data
 */
export async function setEncryptedPhoto(photoId, encryptedData) {
  return setSecurityKey(`encrypted_photo_${photoId}`, encryptedData);
}

/**
 * Hent kryptert foto-data
 * @param {string} photoId - Foto-ID
 * @returns {Promise<string|null>} - Kryptert data eller null
 */
export async function getEncryptedPhoto(photoId) {
  return getSecurityKey(`encrypted_photo_${photoId}`);
}

/**
 * Slett kryptert foto-data
 * @param {string} photoId - Foto-ID
 */
export async function deleteEncryptedPhoto(photoId) {
  return deleteSecurityKey(`encrypted_photo_${photoId}`);
}

/**
 * Lagre private album-IDs
 * @param {Set<string>|Array<string>} albumIds - Private album-IDs
 */
export async function setPrivateAlbums(albumIds) {
  const ids = Array.isArray(albumIds) ? albumIds : Array.from(albumIds);
  return setSecurityKey("private_albums", ids);
}

/**
 * Hent private album-IDs
 * @returns {Promise<Set<string>>} - Set med private album-IDs
 */
export async function getPrivateAlbums() {
  const ids = await getSecurityKey("private_albums");
  return new Set(ids || []);
}

/**
 * Sjekk om album er privat
 * @param {string} albumId - Album-ID
 * @returns {Promise<boolean>} - True hvis privat
 */
export async function isAlbumPrivate(albumId) {
  const privateAlbums = await getPrivateAlbums();
  return privateAlbums.has(albumId);
}

/**
 * Gjør album privat
 * @param {string} albumId - Album-ID
 */
export async function makeAlbumPrivate(albumId) {
  const privateAlbums = await getPrivateAlbums();
  privateAlbums.add(albumId);
  return setPrivateAlbums(privateAlbums);
}

/**
 * Gjør album offentlig
 * @param {string} albumId - Album-ID
 */
export async function makeAlbumPublic(albumId) {
  const privateAlbums = await getPrivateAlbums();
  privateAlbums.delete(albumId);
  return setPrivateAlbums(privateAlbums);
}

/**
 * Få alle sikkerhetsnøkler (for debugging)
 * @returns {Promise<Array>} - Array med alle sikkerhetsnøkler
 */
export async function getAllSecurityKeys() {
  return getAll("security");
}

// ============================================================================
// DATABASE MAINTENANCE
// ============================================================================

// Tilbakestill hele databasen (brukes ved utlogging)
export async function resetDB() {
  for (const store of Object.keys(STORES)) await clear(store);
  console.warn("⚠️  Lokal cache tilbakestilt!");
}

// Tilbakestill kun sikkerhet (bevare photos og albums)
export async function resetSecurity() {
  await clear("security");
  console.warn("⚠️  Sikkerhetsdata tilbakestilt!");
}

/**
 * Få database-statistikk
 * @returns {Promise<Object>} - Statistikk for hver store
 */
export async function getDatabaseStats() {
  const stats = {};
  
  for (const storeName of Object.keys(STORES)) {
    const itemCount = await count(storeName);
    stats[storeName] = itemCount;
  }
  
  return stats;
}

// Export all functions
export default {
  openDB,
  put,
  bulkPut,
  getAll,
  get,
  del,
  clear,
  filter,
  delWhere,
  count,
  getUnsortedPhotos,
  // Security functions
  setSecurityKey,
  getSecurityKey,
  deleteSecurityKey,
  setEncryptedPhoto,
  getEncryptedPhoto,
  deleteEncryptedPhoto,
  setPrivateAlbums,
  getPrivateAlbums,
  isAlbumPrivate,
  makeAlbumPrivate,
  makeAlbumPublic,
  getAllSecurityKeys,
  // Maintenance
  resetDB,
  resetSecurity,
  getDatabaseStats
};
