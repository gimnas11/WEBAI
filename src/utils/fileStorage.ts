// IndexedDB utility for storing file manager data
// Supports larger storage than localStorage and persists across sessions

const DB_NAME = 'gchat_filemanager';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
        objectStore.createIndex('userId', 'userId', { unique: true });
      }
    };
  });
};

export const fileStorage = {
  // Save files for a user
  saveFiles: async (userId: string, files: FileNode[]): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ userId, files, updatedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving files to IndexedDB:', error);
      throw error;
    }
  },

  // Load files for a user
  loadFiles: async (userId: string): Promise<FileNode[] | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise<FileNode[] | null>((resolve, reject) => {
        const request = store.get(userId);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.files : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading files from IndexedDB:', error);
      return null;
    }
  },

  // Delete files for a user
  deleteFiles: async (userId: string): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(userId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting files from IndexedDB:', error);
      throw error;
    }
  },

  // Save expanded folders state
  saveExpandedFolders: (userId: string, expandedFolders: Set<string>): void => {
    try {
      const key = `gchat_expanded_${userId}`;
      localStorage.setItem(key, JSON.stringify(Array.from(expandedFolders)));
    } catch (error) {
      console.error('Error saving expanded folders:', error);
    }
  },

  // Load expanded folders state
  loadExpandedFolders: (userId: string): Set<string> => {
    try {
      const key = `gchat_expanded_${userId}`;
      const data = localStorage.getItem(key);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (error) {
      console.error('Error loading expanded folders:', error);
      return new Set();
    }
  },
};

