import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { FAVORITES_QUERY_KEY } from '@/modules/npm/hooks/useFavorites'
import { fetchUserGist, createUserGist, updateUserGist } from '@/modules/gist/proxy'
import { getStoredGistId, setStoredGistId } from './usePushToGist'
import type { GistDelta } from '@/modules/gist/domain'
import type { FavoritePackage } from '@/modules/npm/domain'

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
): GistDelta {
  return {
    addedInGist: gistFavs.filter((g) => !localFavs.find((l) => l.name === g.name)),
    removedInGist: localFavs.filter((l) => !gistFavs.find((g) => g.name === l.name)),
  }
}

/**
 * Orchestrates the Gist sync flow on login:
 * - No gistId → creates Gist from local favorites
 * - gistId exists + diff found → exposes delta for MergeSyncDialog
 * - No diff → marks as done silently
 */
export function useGistSync(): GistSyncState {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [delta, setDelta] = useState<GistDelta>({ addedInGist: [], removedInGist: [] })
  const [gistFavs, setGistFavs] = useState<FavoritePackage[]>([])

  useEffect(() => {
    if (!user?.githubToken) return

    let cancelled = false

    async function sync() {
      if (!user?.githubToken) return
      setStatus('syncing')

      try {
        const gistId = getStoredGistId(user.uid)

        if (!gistId) {
          const favorites = favoritesStorage.getAll()
          const created = await createUserGist(favorites, user.githubToken)
          setStoredGistId(user.uid, created.gistId)
          if (!cancelled) setStatus('done')
          return
        }

        const remote = await fetchUserGist(gistId, user.githubToken)
        const localFavs = favoritesStorage.getAll()
        const computed = computeDelta(localFavs, remote.favorites)

        if (cancelled) return

        const hasDiff =
          computed.addedInGist.length > 0 || computed.removedInGist.length > 0

        if (!hasDiff) {
          setStatus('done')
        } else {
          setGistFavs(remote.favorites)
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
    const merged = [
      ...localFavs,
      ...gistFavs.filter((g) => !localFavs.find((l) => l.name === g.name)),
    ]
    favoritesStorage.replace(merged)
    queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
    const gistId = getStoredGistId(user.uid)
    if (gistId) updateUserGist(gistId, merged, user.githubToken).catch(() => {})
    setStatus('done')
  }

  function resolveReplaceWithLocal() {
    if (!user?.githubToken) return
    const localFavs = favoritesStorage.getAll()
    const gistId = getStoredGistId(user.uid)
    if (gistId) updateUserGist(gistId, localFavs, user.githubToken).catch(() => {})
    setStatus('done')
  }

  return { status, delta, resolveKeepAll, resolveReplaceWithLocal }
}
