/* model3d-db.js — IndexedDB wrapper for product 3D models (GLB blobs) */
'use strict';

const Model3DDB = (() => {
  const DB_NAME = 'bathroom-model3d-db';
  const DB_VERSION = 1;
  const STORE = 'models';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  return {
    async put(id, blob) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(blob, id);
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
      });
    },

    async get(id) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = e => resolve(e.target.result || null);
        req.onerror = e => reject(e.target.error);
      });
    },

    async remove(id) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
      });
    },

    async getAllKeys() {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAllKeys();
        req.onsuccess = e => resolve(e.target.result || []);
        req.onerror = e => reject(e.target.error);
      });
    },
  };
})();

window.Model3DDB = Model3DDB;
