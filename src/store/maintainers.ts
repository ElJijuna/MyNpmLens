import { getDb } from '@/lib/db'
import type { FollowedMaintainer } from '@/modules/npm/domain'

const KEY = 'maintainers'

export const maintainersStorage = {
  async getAll(): Promise<FollowedMaintainer[]> {
    const db = await getDb()
    return (await db.get('user-data', KEY)) ?? []
  },

  async add(username: string): Promise<void> {
    const db = await getDb()
    const all = await this.getAll()
    if (all.some((m) => m.username === username)) return
    await db.put('user-data', [...all, { username, addedAt: new Date().toISOString() }], KEY)
  },

  async remove(username: string): Promise<void> {
    const db = await getDb()
    const updated = (await this.getAll()).filter((m) => m.username !== username)
    await db.put('user-data', updated, KEY)
  },

  async replace(items: FollowedMaintainer[]): Promise<void> {
    const db = await getDb()
    await db.put('user-data', items, KEY)
  },
}
