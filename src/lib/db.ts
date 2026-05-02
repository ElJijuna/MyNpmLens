import { openDB, type IDBPDatabase } from 'idb'

let _db: Promise<IDBPDatabase> | null = null

export function getDb(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = openDB('mynpmlens', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) db.createObjectStore('query-cache')
        if (oldVersion < 2) db.createObjectStore('user-data')
      },
    })
  }
  return _db
}

const LS_KEYS = ['favorites', 'maintainers', 'settings'] as const

export async function migrateFromLocalStorage(db: IDBPDatabase): Promise<void> {
  for (const key of LS_KEYS) {
    const raw = localStorage.getItem(`mynpmlens:${key}`)
    if (raw === null) continue
    try {
      const existing = await db.get('user-data', key)
      if (existing === undefined) {
        await db.put('user-data', JSON.parse(raw), key)
      }
    } catch {
      // skip malformed entries
    }
    localStorage.removeItem(`mynpmlens:${key}`)
  }
}

export async function getGistId(uid: string): Promise<string | null> {
  const db = await getDb()
  return (await db.get('user-data', `gist:${uid}`)) ?? null
}

export async function saveGistId(uid: string, gistId: string): Promise<void> {
  const db = await getDb()
  await db.put('user-data', gistId, `gist:${uid}`)
}
