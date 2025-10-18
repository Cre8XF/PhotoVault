// ============================================================================
// PhotoVault Local Cache – IndexedDB for album og bilder
// v3.0 – optimalisert for Firebase-integrasjon
// ============================================================================

const DB_NAME = "PhotoVaultDB";
const DB_VERSION = 3;

const STORES = {
  albums: { keyPath: "id" },
  photos: { keyPath: "id" },
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
// Hent bilder uten album
// ============================================================================
export async function getUnsortedPhotos() {
  const allPhotos = await getAll("photos");
  return allPhotos.filter((p) => !p.albumId);
}



// Tilbakestill hele databasen (brukes ved utlogging)
export async function resetDB() {
  for (const store of Object.keys(STORES)) await clear(store);
  console.warn("⚠️  Lokal cache tilbakestilt!");
}
