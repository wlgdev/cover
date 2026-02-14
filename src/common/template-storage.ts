export const TEMPLATE_KINDS = ["youtube", "twitch", "post"] as const;
export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

const LEGACY_TEMPLATE_KEYS: Record<TemplateKind, string> = {
  youtube: "wlgcover:video-templates",
  twitch: "wlgcover:stream-templates",
  post: "wlgcover:post-templates",
};

const DB_NAME = "wlgcover";
const DB_VERSION = 1;
const STORE_NAME = "templates";
const INDEX_KIND = "by_kind";
const MIGRATION_KEY = "wlgcover:templates-migrated-v1";

type TemplateRecord<T = unknown> = {
  kind: TemplateKind;
  name: string;
  snapshot: T;
  updated_at: number;
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function canUseIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (!canUseIndexedDb()) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: ["kind", "name"] });
        store.createIndex(INDEX_KIND, "kind", { unique: false });
        return;
      }

      const store = request.transaction?.objectStore(STORE_NAME);
      if (store && !store.indexNames.contains(INDEX_KIND)) {
        store.createIndex(INDEX_KIND, "kind", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn("[template-storage] IndexedDB open failed", request.error);
      resolve(null);
    };
    request.onblocked = () => {
      console.warn("[template-storage] IndexedDB open blocked");
    };
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function readLegacyTemplates(kind: TemplateKind): Record<string, unknown> {
  const raw = localStorage.getItem(LEGACY_TEMPLATE_KEYS[kind]);
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== "object") return {};
    return data;
  } catch {
    return {};
  }
}

function writeLegacyTemplate<T>(kind: TemplateKind, name: string, snapshot: T) {
  const templates = readLegacyTemplates(kind) as Record<string, T>;
  templates[name] = snapshot;
  localStorage.setItem(LEGACY_TEMPLATE_KEYS[kind], JSON.stringify(templates));
}

function deleteLegacyTemplate(kind: TemplateKind, name: string) {
  const templates = readLegacyTemplates(kind);
  if (!templates[name]) return;
  delete templates[name];
  localStorage.setItem(LEGACY_TEMPLATE_KEYS[kind], JSON.stringify(templates));
}

export async function readTemplates<T>(kind: TemplateKind): Promise<Record<string, T>> {
  const db = await openDb();
  if (!db) return readLegacyTemplates(kind) as Record<string, T>;

  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index(INDEX_KIND);
    const records = await requestToPromise(index.getAll(IDBKeyRange.only(kind)));
    await txDone(tx);

    const result: Record<string, T> = {};
    for (const record of records as TemplateRecord<T>[]) {
      result[record.name] = record.snapshot;
    }
    return result;
  } catch (error) {
    console.warn("[template-storage] IndexedDB read failed, fallback to localStorage", error);
    return readLegacyTemplates(kind) as Record<string, T>;
  }
}

export async function saveTemplate<T>(kind: TemplateKind, name: string, snapshot: T): Promise<void> {
  const db = await openDb();
  if (!db) {
    writeLegacyTemplate(kind, name, snapshot);
    return;
  }

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({
      kind,
      name,
      snapshot,
      updated_at: Date.now(),
    } satisfies TemplateRecord<T>);
    await txDone(tx);
  } catch (error) {
    console.warn("[template-storage] IndexedDB write failed, fallback to localStorage", error);
    writeLegacyTemplate(kind, name, snapshot);
  }
}

export async function deleteTemplate(kind: TemplateKind, name: string): Promise<void> {
  const db = await openDb();
  if (!db) {
    deleteLegacyTemplate(kind, name);
    return;
  }

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete([kind, name]);
    await txDone(tx);
  } catch (error) {
    console.warn("[template-storage] IndexedDB delete failed, fallback to localStorage", error);
    deleteLegacyTemplate(kind, name);
  }
}

export async function migrateLegacyTemplates(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  if (localStorage.getItem(MIGRATION_KEY) === "1") return;

  const hasLegacyData = TEMPLATE_KINDS.some((kind) => Object.keys(readLegacyTemplates(kind)).length > 0);
  if (!hasLegacyData) {
    localStorage.setItem(MIGRATION_KEY, "1");
    return;
  }

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const kind of TEMPLATE_KINDS) {
      const legacy = readLegacyTemplates(kind);
      for (const [name, snapshot] of Object.entries(legacy)) {
        store.put({
          kind,
          name,
          snapshot,
          updated_at: Date.now(),
        } satisfies TemplateRecord);
      }
    }

    await txDone(tx);
    localStorage.setItem(MIGRATION_KEY, "1");
  } catch (error) {
    console.warn("[template-storage] IndexedDB migration failed", error);
  }
}
