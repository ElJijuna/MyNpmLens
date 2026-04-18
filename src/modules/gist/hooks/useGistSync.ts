import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'
import { FAVORITES_QUERY_KEY } from '@/modules/npm/hooks/useFavorites'
import { MAINTAINERS_QUERY_KEY } from '@/modules/npm/hooks/useMaintainers'
import { fetchUserGist, findUserGist, createUserGist, updateUserGist } from '@/modules/gist/proxy'
import { getStoredGistId, setStoredGistId } from './usePushToGist'
import type { GistDelta } from '@/modules/gist/domain'
import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'

type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'done' | 'error'

interface GistSyncState {
  status: SyncStatus
  delta: GistDelta
  resolveKeepAll: () => void
  resolveReplaceWithLocal: () => void
}

function computeDelta(
  localFavs: FavoritePackage[],
  gistFavs: FavoritePackage[],
  localMaintainers: FollowedMaintainer[],
  gistMaintainers: FollowedMaintainer[],
): GistDelta {
  return {
    addedInGist: gistFavs.filter((g) => !localFavs.find((l) => l.name === g.name)),
    removedInGist: localFavs.filter((l) => !gistFavs.find((g) => g.name === l.name)),
    addedMaintainersInGist: gistMaintainers.filter((g) => !localMaintainers.find((l) => l.username === g.username)),
    removedMaintainersInGist: localMaintainers.filter((l) => !gistMaintainers.find((g) => g.username === l.username)),
  }
}

export function useGistSync(): GistSyncState {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [delta, setDelta] = useState<GistDelta>({
    addedInGist: [],
    removedInGist: [],
    addedMaintainersInGist: [],
    removedMaintainersInGist: [],
  })
  const [gistFavs, setGistFavs] = useState<FavoritePackage[]>([])
  const [gistMaintainers, setGistMaintainers] = useState<FollowedMaintainer[]>([])

  useEffect(() => {
    if (!user?.githubToken) return

    let cancelled = false

    async function sync() {
      if (!user?.githubToken) return
      setStatus('syncing')

      try {
        const gistId = getStoredGistId(user.uid)

        if (!gistId) {
          const existing = await findUserGist(user.githubToken)

          if (existing) {
            setStoredGistId(user.uid, existing.gistId)
            const localFavs = favoritesStorage.getAll()
            const localMaintainers = maintainersStorage.getAll()
            const computed = computeDelta(localFavs, existing.favorites, localMaintainers, existing.maintainers)
            const hasDiff =
              computed.addedInGist.length > 0 ||
              computed.removedInGist.length > 0 ||
              computed.addedMaintainersInGist.length > 0 ||
              computed.removedMaintainersInGist.length > 0
            if (!cancelled) {
              if (hasDiff) {
                setGistFavs(existing.favorites)
                setGistMaintainers(existing.maintainers)
                setDelta(computed)
                setStatus('conflict')
              } else {
                setStatus('done')
              }
            }
            return
          }

          const favorites = favoritesStorage.getAll()
          const maintainers = maintainersStorage.getAll()
          const created = await createUserGist(favorites, maintainers, user.githubToken)
          setStoredGistId(user.uid, created.gistId)
          if (!cancelled) setStatus('done')
          return
        }

        const remote = await fetchUserGist(gistId, user.githubToken)
        const localFavs = favoritesStorage.getAll()
        const localMaintainers = maintainersStorage.getAll()
        const computed = computeDelta(localFavs, remote.favorites, localMaintainers, remote.maintainers)

        if (cancelled) return

        const hasDiff =
          computed.addedInGist.length > 0 ||
          computed.removedInGist.length > 0 ||
          computed.addedMaintainersInGist.length > 0 ||
          computed.removedMaintainersInGist.length > 0

        if (!hasDiff) {
          setStatus('done')
        } else {
          setGistFavs(remote.favorites)
          setGistMaintainers(remote.maintainers)
          setDelta(computed)
          setStatus('conflict')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    sync()
    return () => { cancelled = true }
  }, [user?.uid, user?.githubToken])

  function resolveKeepAll() {
    if (!user?.githubToken) return

    const localFavs = favoritesStorage.getAll()
    const mergedFavs = [
      ...localFavs,
      ...gistFavs.filter((g) => !localFavs.find((l) => l.name === g.name)),
    ]
    favoritesStorage.replace(mergedFavs)
    queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })

    const localMaintainers = maintainersStorage.getAll()
    const mergedMaintainers = [
      ...localMaintainers,
      ...gistMaintainers.filter((g) => !localMaintainers.find((l) => l.username === g.username)),
    ]
    maintainersStorage.replace(mergedMaintainers)
    queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY })

    const gistId = getStoredGistId(user.uid)
    if (gistId) updateUserGist(gistId, mergedFavs, mergedMaintainers, user.githubToken).catch(() => {})
    setStatus('done')
  }

  function resolveReplaceWithLocal() {
    if (!user?.githubToken) return
    const localFavs = favoritesStorage.getAll()
    const localMaintainers = maintainersStorage.getAll()
    const gistId = getStoredGistId(user.uid)
    if (gistId) updateUserGist(gistId, localFavs, localMaintainers, user.githubToken).catch(() => {})
    setStatus('done')
  }

  return { status, delta, resolveKeepAll, resolveReplaceWithLocal }
}
