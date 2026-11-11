/**
 * ChanSeller offline preview storage.
 * IndexedDB keeps saved images and listing drafts in THIS browser only.
 * It is not shared across devices and does not replace a real tenant-isolated database.
 */
export interface SavedProduct {
  id: string;
  name: string;
  createdAt: number;
  preset: string;
  image: Blob;
}
export interface SavedDraft {
  id: string;
  name: string;
  platform: string;
  createdAt: number;
  title: string;
  description: string;
  caption: string;
  hashtags: string;
  source: "gemini" | "template";
}
type Table = "products" | "drafts";
const DATABASE_NAME = "chanseller-local-preview";
const VERSION = 1;

function connect(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not support local project storage."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("products")) db.createObjectStore("products", { keyPath: "id" });
      if (!db.objectStoreNames.contains("drafts")) db.createObjectStore("drafts", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local storage."));
  });
}
async function requestFromStore<T>(table: Table, mode: IDBTransactionMode, make: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await connect();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(table, mode);
    const request = make(transaction.objectStore(table));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Storage operation failed."));
    transaction.onerror = () => reject(transaction.error || new Error("Storage transaction failed."));
    transaction.oncomplete = () => db.close();
    transaction.onabort = () => db.close();
  });
}
export async function saveProduct(product: SavedProduct): Promise<void> {
  await requestFromStore("products", "readwrite", store => store.put(product));
}
export async function getProducts(): Promise<SavedProduct[]> {
  const products = await requestFromStore<SavedProduct[]>("products", "readonly", store => store.getAll());
  return products.sort((a,b) => b.createdAt-a.createdAt);
}
export async function getProduct(id: string): Promise<SavedProduct | undefined> {
  return requestFromStore("products", "readonly", store => store.get(id));
}
export async function deleteProduct(id: string): Promise<void> {
  await requestFromStore("products", "readwrite", store => store.delete(id));
}
export async function saveDraft(draft: SavedDraft): Promise<void> {
  await requestFromStore("drafts", "readwrite", store => store.put(draft));
}
export async function getDrafts(): Promise<SavedDraft[]> {
  const drafts = await requestFromStore<SavedDraft[]>("drafts", "readonly", store => store.getAll());
  return drafts.sort((a,b) => b.createdAt-a.createdAt);
}
export async function deleteDraft(id: string): Promise<void> {
  await requestFromStore("drafts", "readwrite", store => store.delete(id));
}
export async function eraseLocalData(): Promise<void> {
  const db = await connect();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(["products", "drafts"], "readwrite");
    transaction.objectStore("products").clear();
    transaction.objectStore("drafts").clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not erase projects."));
  });
  db.close();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("chanseller-brand-kit");
    window.localStorage.removeItem("chanseller-profile");
  }
}
export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp));
}
export function generateId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
