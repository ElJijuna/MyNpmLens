/**
 * Raw localStorage persistence layer for favorite packages.
 * Do not use directly from components — use the hooks in modules/npm/hooks instead.
 */

const STORAGE_KEY = 'mynpmlens:favorites'

export interface FavoritePackage {
  name: string
  addedAt: string
}

export const favoritesStorage = {
  getAll(): FavoritePackage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as FavoritePackage[]) : []
    } catch {
      return []
    }
  },

  add(name: string): FavoritePackage[] {
    const current = this.getAll()
    if (current.some((p) => p.name === name)) return current
    const updated = [...current, { name, addedAt: new Date().toISOString() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  },

  remove(name: string): FavoritePackage[] {
    const updated = this.getAll().filter((p) => p.name !== name)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  },
}
