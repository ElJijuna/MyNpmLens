import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGhGist, useGhCreateGist, useGhUpdateGist } from '@api-hooks/gh'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'
import { settingsStorage } from '@/store/settings'
import { FAVORITES_QUERY_KEY } from '@/modules/npm/hooks/useFavorites'
import { MAINTAINERS_QUERY_KEY } from '@/modules/npm/hooks/useMaintainers'
import { SETTINGS_QUERY_KEY } from '@/modules/settings/hooks'
import type { AppSettings } from '@/modules/settings/domain'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'
import { getStoredGistId, setStoredGistId, GIST_FILENAME } from './usePushToGist'
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

function parseGistContent(content: string): { favorites: FavoritePackage[]; maintainers: FollowedMaintainer[]; settings: AppSettings } {
  try {
    const parsed = JSON.parse(content) as { favorites?: FavoritePackage[]; maintainers?: FollowedMaintainer[]; settings?: AppSettings }
    return {
      favorites: parsed.favorites ?? [],
      maintainers: parsed.maintainers ?? [],
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
    }
  } catch {
    return { favorites: [], maintainers: [], settings: DEFAULT_SETTINGS }
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
  const [gistId, setGistId] = useState<string | null>(() => user ? getStoredGistId(user.uid) : null)
  const [gistFavs, setGistFavs] = useState<FavoritePackage[]>([])
  const [gistMaintainers, setGistMaintainers] = useState<FollowedMaintainer[]>([])
  const [gistSettings, setGistSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const createGist = useGhCreateGist({ token: user?.githubToken })
  const updateGist = useGhUpdateGist(gistId ?? '', { token: user?.githubToken })

  const { data: remoteGist, isSuccess: gistLoaded, isError: gistError } = useGhGist(gistId ?? '', {
    enabled: !!gistId && !!user?.githubToken && status === 'syncing',
    token: user?.githubToken,
  })

  // Trigger sync on login
  useEffect(() => {
    if (!user?.githubToken) {
      setStatus('idle')
      return
    }
    const storedId = getStoredGistId(user.uid)
    setGistId(storedId)
    setStatus('syncing')
  }, [user?.uid, user?.githubToken])

  // Create gist if none exists
  useEffect(() => {
    if (status !== 'syncing' || gistId || !user?.githubToken) return

    const favorites = favoritesStorage.getAll()
    const maintainers = maintainersStorage.getAll()
    const settings = settingsStorage.get()
    const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)

    createGist.mutate(
      { description: 'MyNpmLens sync', public: false, files: { [GIST_FILENAME]: { content } } },
      {
        onSuccess: (created) => {
          setStoredGistId(user.uid, created.id)
          setGistId(created.id)
          setStatus('done')
        },
        onError: () => setStatus('error'),
      },
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, gistId, user?.uid, user?.githubToken])

  // Process fetched remote gist
  useEffect(() => {
    if (!gistLoaded || !remoteGist) return

    const raw = remoteGist.files[GIST_FILENAME]?.content ?? '{}'
    const { favorites: remoteFavs, maintainers: remoteMaintainers, settings: remoteSettings } = parseGistContent(raw)
    const localFavs = favoritesStorage.getAll()
    const localMaintainers = maintainersStorage.getAll()
    const computed = computeDelta(localFavs, remoteFavs, localMaintainers, remoteMaintainers)

    const hasDiff =
      computed.addedInGist.length > 0 ||
      computed.removedInGist.length > 0 ||
      computed.addedMaintainersInGist.length > 0 ||
      computed.removedMaintainersInGist.length > 0

    if (!hasDiff) {
      // Apply remote settings silently (last writer wins)
      settingsStorage.replace(remoteSettings)
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
      setStatus('done')
    } else {
      setGistFavs(remoteFavs)
      setGistMaintainers(remoteMaintainers)
      setGistSettings(remoteSettings)
      setDelta(computed)
      setStatus('conflict')
    }
  }, [gistLoaded, remoteGist])

  useEffect(() => {
    if (gistError) setStatus('error')
  }, [gistError])

  function resolveKeepAll() {
    if (!user?.githubToken || !gistId) return

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

    // Settings: remote wins on keep-all
    settingsStorage.replace(gistSettings)
    queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })

    const settings = gistSettings
    const content = JSON.stringify({ favorites: mergedFavs, maintainers: mergedMaintainers, settings }, null, 2)
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } })
    setStatus('done')
  }

  function resolveReplaceWithLocal() {
    if (!user?.githubToken || !gistId) return
    const favorites = favoritesStorage.getAll()
    const maintainers = maintainersStorage.getAll()
    const settings = settingsStorage.get()
    const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } })
    setStatus('done')
  }

  return { status, delta, resolveKeepAll, resolveReplaceWithLocal }
}
