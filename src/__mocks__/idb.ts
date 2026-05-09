type StoreName = string
type StoreKey = IDBValidKey

function storageKey(storeName: StoreName, key: StoreKey) {
  return `idb:${storeName}:${String(key)}`
}

export function openDB(_name: string, _version?: number, options?: { upgrade?: (db: { createObjectStore: (name: string) => void }, oldVersion: number) => void }) {
  options?.upgrade?.({ createObjectStore: jest.fn() }, 0)

  return Promise.resolve({
    async get(storeName: StoreName, key: StoreKey) {
      const raw = localStorage.getItem(storageKey(storeName, key))
      return raw == null ? undefined : JSON.parse(raw)
    },

    async put(storeName: StoreName, value: unknown, key: StoreKey) {
      localStorage.setItem(storageKey(storeName, key), JSON.stringify(value))
      return key
    },

    async delete(storeName: StoreName, key: StoreKey) {
      localStorage.removeItem(storageKey(storeName, key))
    },
  })
}
