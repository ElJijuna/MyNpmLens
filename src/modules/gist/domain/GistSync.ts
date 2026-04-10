import type { FavoritePackage } from '@/modules/npm/domain'

export interface GistSync {
  gistId: string
  favorites: FavoritePackage[]
  updatedAt: string
}

export interface GistDelta {
  addedInGist: FavoritePackage[]
  removedInGist: FavoritePackage[]
}
