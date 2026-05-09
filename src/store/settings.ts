import { getDb } from '@/lib/db'
import type { AppSettings } from '@/modules/settings/domain'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'

const KEY = 'settings'

export const settingsStorage = {
  async get(): Promise<AppSettings> {
    const db = await getDb()
    const raw = await db.get('user-data', KEY)
    return { ...DEFAULT_SETTINGS, ...(raw ?? {}) }
  },

  async set(settings: AppSettings): Promise<void> {
    const db = await getDb()
    await db.put('user-data', settings, KEY)
  },
}
