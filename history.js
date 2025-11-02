(function(global) {
  "use strict";

  const DB_NAME = "jadict_history";
  const DB_VERSION = 1;
  const STORE_NAME = "entries";
  const DEFAULT_LIMIT = 200;
  let dbPromise = null;

  function hasIndexedDB() {
    return typeof global.indexedDB !== "undefined";
  }

  function openDatabase() {
    if (!hasIndexedDB()) {
      return Promise.reject(new Error("IndexedDB không được hỗ trợ"));
    }

    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = global.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          return;
        }
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id"
        });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("tabId", "tabId", { unique: false });
        store.createIndex("queryLower", "queryLower", { unique: false });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return dbPromise;
  }

  function ensureId(value) {
    if (value && typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return `hist_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  async function init() {
    try {
      await openDatabase();
      return true;
    } catch (error) {
      console.error("JaDict: Không khởi tạo được lịch sử", error);
      return false;
    }
  }

  async function addEntry(entry) {
    if (!entry || typeof entry !== "object") {
      throw new Error("Entry không hợp lệ");
    }

    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const normalized = {
      id: ensureId(entry.id),
      type: entry.type === "chat" ? "chat" : "lookup",
      query: entry.query || "",
      queryLower: (entry.query || "").toLowerCase(),
      response: entry.response ?? null,
      timestamp: typeof entry.timestamp === "number" ? entry.timestamp : Date.now(),
      tabId: entry.tabId ?? null,
      url: entry.url ?? null,
      metadata: entry.metadata ?? null
    };

    await new Promise((resolve, reject) => {
      const request = store.put(normalized);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return normalized.id;
  }

  async function deleteEntry(id) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function clearAll() {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  function matchesSearch(entry, searchTerm) {
    if (!searchTerm) {
      return true;
    }
    const lowered = searchTerm.toLowerCase();
    if (entry.queryLower && entry.queryLower.includes(lowered)) {
      return true;
    }
    if (entry.response) {
      try {
        if (typeof entry.response === "string") {
          return entry.response.toLowerCase().includes(lowered);
        }
        const json = JSON.stringify(entry.response).toLowerCase();
        return json.includes(lowered);
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  async function getEntries(options = {}) {
    const {
      type = "all",
      search = "",
      limit = DEFAULT_LIMIT,
      direction = "desc"
    } = options;

    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("timestamp");

    const results = [];
    const range = null;
    const cursorDirection = direction === "asc" ? "next" : "prev";

    await new Promise((resolve, reject) => {
      const request = index.openCursor(range, cursorDirection);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor || results.length >= limit) {
          resolve();
          return;
        }

        const value = cursor.value;
        const typeMatches = type === "all" || value.type === type;
        const searchMatches = matchesSearch(value, search);

        if (typeMatches && searchMatches) {
          results.push(value);
        }

        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });

    return results;
  }

  async function deleteOlderThan(days) {
    if (!Number.isFinite(days) || days <= 0) {
      return;
    }
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("timestamp");

    await new Promise((resolve, reject) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) {
          resolve();
          return;
        }
        if (cursor.value.timestamp < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function exportEntries() {
    const entries = await getEntries({ limit: Number.MAX_SAFE_INTEGER, direction: "asc" });
    return entries;
  }

  global.JA_HISTORY = {
    init,
    addEntry,
    deleteEntry,
    clearAll,
    deleteOlderThan,
    getEntries,
    exportEntries
  };
})(typeof self !== "undefined" ? self : window);
