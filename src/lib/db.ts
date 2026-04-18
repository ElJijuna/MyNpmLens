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

export async function getGistId(uid: string): Promise<string | null> {
  const db = await getDb()
  return (await db.get('user-data', `gist:${uid}`)) ?? null
}

export async function saveGistId(uid: string, gistId: string): Promise<void> {
  const db = await getDb()
  await db.put('user-data', gistId, `gist:${uid}`)
}
