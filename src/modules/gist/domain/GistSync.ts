import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'
import type { AppSettings } from '@/modules/settings/domain'

export interface GistSync {
  gistId: string
  favorites: FavoritePackage[]
  maintainers: FollowedMaintainer[]
  settings: AppSettings
  updatedAt: string
}

export interface GistDelta {
  addedInGist: FavoritePackage[]
  removedInGist: FavoritePackage[]
  addedMaintainersInGist: FollowedMaintainer[]
  removedMaintainersInGist: FollowedMaintainer[]
}
