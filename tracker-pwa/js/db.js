// Wrapper IndexedDB con promesas para Fuerza PWA
const DB_NAME = 'fuerza_db';
const DB_VERSION = 1;

let dbPromise = null;

export async function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Almacén de ejercicios
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
        exerciseStore.createIndex('by_group', 'grupoPrimario', { unique: false });
        exerciseStore.createIndex('by_name', 'nombre', { unique: false });
      }

      // 2. Almacén de plantillas (rutinas)
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('by_name', 'nombre', { unique: false });
      }

      // 3. Almacén de sesiones completadas / historial
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by_date', 'fecha', { unique: false });
        sessionStore.createIndex('by_template', 'templateId', { unique: false });
      }

      // 4. Almacén de sesión activa (recuperable tras cierre de iOS)
      if (!db.objectStoreNames.contains('active_session')) {
        db.createObjectStore('active_session', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Error al abrir base de datos:', event.target.error);
      reject(event.target.error);
    };
  });

  return dbPromise;
}

// Operaciones CRUD genéricas
export async function dbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// Persistencia de almacenamiento (navigator.storage.persist)
export async function requestStoragePersistence() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const granted = await navigator.storage.persist();
        console.log(`[Storage] Persistencia concedida: ${granted}`);
        return granted;
      }
      console.log('[Storage] Almacenamiento ya es persistente.');
      return true;
    } catch (e) {
      console.warn('[Storage] Error al solicitar almacenamiento persistente:', e);
      return false;
    }
  }
  return false;
}

// Métodos especializados para sesión activa
export async function saveActiveSession(sessionData) {
  if (!sessionData) {
    return dbDelete('active_session', 'current');
  }
  return dbPut('active_session', { key: 'current', data: sessionData, updatedAt: Date.now() });
}

export async function getActiveSession() {
  const entry = await dbGet('active_session', 'current');
  return entry ? entry.data : null;
}

export async function clearActiveSession() {
  return dbDelete('active_session', 'current');
}
