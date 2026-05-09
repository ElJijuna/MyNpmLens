import { getDb } from '@/lib/db'
import type { FavoritePackage } from '@/modules/npm/domain'

const KEY = 'favorites'

export const favoritesStorage = {
  async getAll(): Promise<FavoritePackage[]> {
    const db = await getDb()
    return (await db.get('user-data', KEY)) ?? []
  },

  async add(name: string): Promise<void> {
    const db = await getDb()
    const all = await this.getAll()
    if (all.some((p) => p.name === name)) return
    await db.put('user-data', [...all, { name, addedAt: new Date().toISOString() }], KEY)
  },

  async remove(name: string): Promise<void> {
    const db = await getDb()
    const updated = (await this.getAll()).filter((p) => p.name !== name)
    await db.put('user-data', updated, KEY)
  },

  async replace(favorites: FavoritePackage[]): Promise<void> {
    const db = await getDb()
    await db.put('user-data', favorites, KEY)
  },
}
