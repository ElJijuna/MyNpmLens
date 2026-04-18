import type { AppSettings } from '@/modules/settings/domain'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'

const STORAGE_KEY = 'mynpmlens:settings'

export const settingsStorage = {
  get(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  },

  set(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  },

  replace(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  },
}
