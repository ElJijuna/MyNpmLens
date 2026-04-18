import type { FollowedMaintainer } from '@/modules/npm/domain'

const STORAGE_KEY = 'mynpmlens:maintainers'

export const maintainersStorage = {
  getAll(): FollowedMaintainer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as FollowedMaintainer[]) : []
    } catch {
      return []
    }
  },

  add(username: string): void {
    const current = this.getAll()
    if (current.some((m) => m.username === username)) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, { username }]))
  },

  remove(username: string): void {
    const updated = this.getAll().filter((m) => m.username !== username)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  },

  replace(items: FollowedMaintainer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },
}
