import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGhGist, useGhGists, useGhCreateGist, useGhUpdateGist } from '@api-hooks/gh'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'
import { settingsStorage } from '@/store/settings'
import { FAVORITES_QUERY_KEY } from '@/modules/npm/hooks/useFavorites'
import { MAINTAINERS_QUERY_KEY } from '@/modules/npm/hooks/useMaintainers'
import { SETTINGS_QUERY_KEY } from '@/modules/settings/hooks'
import type { AppSettings } from '@/modules/settings/domain'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'
import { getGistId, saveGistId } from '@/lib/db'
import { GIST_FILENAME } from './usePushToGist'
import type { GistDelta } from '@/modules/gist/domain'
import type { FavoritePackage } from '@/modules/npm/domain'
import type { FollowedMaintainer } from '@/modules/npm/domain'

type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'done' | 'error'

interface GistSyncState {
  status: SyncStatus
  delta: GistDelta
  gistFavorites: FavoritePackage[]
  gistMaintainers: FollowedMaintainer[]
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
  const [gistId, setGistId] = useState<string | null>(null)
  // true once we've read IndexedDB (prevents acting before the stored id is known)
  const [gistIdLoaded, setGistIdLoaded] = useState(false)
  const [gistFavs, setGistFavs] = useState<FavoritePackage[]>([])
  const [gistMaintainers, setGistMaintainers] = useState<FollowedMaintainer[]>([])
  const [gistSettings, setGistSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const createGist = useGhCreateGist({ token: user?.githubToken })
  const updateGist = useGhUpdateGist(gistId ?? '', { token: user?.githubToken })

  // Load stored gist id from IndexedDB whenever the logged-in user changes
  useEffect(() => {
    if (!user?.uid) {
      setGistId(null)
      setGistIdLoaded(false)
      return
    }
    setGistIdLoaded(false)
    getGistId(user.uid).then((id) => {
      setGistId(id)
      setGistIdLoaded(true)
    })
  }, [user?.uid])

  // Trigger sync once after login (wait for IndexedDB read)
  useEffect(() => {
    if (!user?.githubToken || !gistIdLoaded) {
      if (!user?.githubToken) setStatus('idle')
      return
    }
    setStatus('syncing')
  }, [user?.uid, user?.githubToken, gistIdLoaded])

  // Search the user's gists only when no id is stored — runs at most once per login
  const { data: gistsList, isSuccess: listsLoaded } = useGhGists(
    { per_page: 100 },
    {
      enabled: gistIdLoaded && !gistId && status === 'syncing' && !!user?.githubToken,
      token: user?.githubToken,
    },
  )

  // When the gists list arrives, either reuse the existing gist or create a new one
  useEffect(() => {
    if (!listsLoaded || gistId || !user?.githubToken) return

    const uid = user.uid
    const found = gistsList?.values.find((g) => GIST_FILENAME in g.files)

    if (found) {
      saveGistId(uid, found.id)
      setGistId(found.id)
      // useGhGist picks up the new id and handles the rest
    } else {
      void Promise.all([
        favoritesStorage.getAll(),
        maintainersStorage.getAll(),
        settingsStorage.get(),
      ])
        .then(([favorites, maintainers, settings]) => {
          const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)
          createGist.mutate(
            { description: 'MyNpmLens sync', public: false, files: { [GIST_FILENAME]: { content } } },
            {
              onSuccess: (created) => {
                saveGistId(uid, created.id)
                setGistId(created.id)
                setStatus('done')
              },
              onError: () => setStatus('error'),
            },
          )
        })
        .catch(() => setStatus('error'))
    }
  }, [listsLoaded, gistId, user?.uid, user?.githubToken])

  // Fetch the remote gist content once we have an id
  const { data: remoteGist, isSuccess: gistLoaded, isError: gistError } = useGhGist(gistId ?? '', {
    enabled: !!gistId && !!user?.githubToken && status === 'syncing',
    token: user?.githubToken,
  })

  // Compare remote vs local and decide if there's a conflict
  useEffect(() => {
    if (!gistLoaded || !remoteGist) return

    const gist = remoteGist
    let cancelled = false

    async function compareGist() {
      const raw = gist.files[GIST_FILENAME]?.content ?? '{}'
      const { favorites: remoteFavs, maintainers: remoteMaintainers, settings: remoteSettings } = parseGistContent(raw)
      const [localFavs, localMaintainers] = await Promise.all([
        favoritesStorage.getAll(),
        maintainersStorage.getAll(),
      ])

      if (cancelled) return

      if (localFavs.length === 0 && localMaintainers.length === 0 && (remoteFavs.length > 0 || remoteMaintainers.length > 0)) {
        const now = new Date().toISOString()
        await Promise.all([
          favoritesStorage.replace(remoteFavs.map(f => ({ ...f, addedAt: f.addedAt ?? now }))),
          maintainersStorage.replace(remoteMaintainers.map(m => ({ ...m, addedAt: m.addedAt ?? now }))),
          settingsStorage.set(remoteSettings),
        ])
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
        setGistFavs(remoteFavs)
        setGistMaintainers(remoteMaintainers)
        setStatus('done')
        return
      }

      const computed = computeDelta(localFavs, remoteFavs, localMaintainers, remoteMaintainers)

      const hasDiff =
        computed.addedInGist.length > 0 ||
        computed.removedInGist.length > 0 ||
        computed.addedMaintainersInGist.length > 0 ||
        computed.removedMaintainersInGist.length > 0

      if (!hasDiff) {
        await settingsStorage.set(remoteSettings)
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
        setStatus('done')
      } else {
        setGistFavs(remoteFavs)
        setGistMaintainers(remoteMaintainers)
        setGistSettings(remoteSettings)
        setDelta(computed)
        setStatus('conflict')
      }
    }

    void compareGist().catch(() => setStatus('error'))

    return () => {
      cancelled = true
    }
  }, [gistLoaded, remoteGist])

  useEffect(() => {
    if (gistError) setStatus('error')
  }, [gistError])

  async function resolveKeepAll() {
    if (!user?.githubToken || !gistId) return

    const localFavs = await favoritesStorage.getAll()
    const now = new Date().toISOString()
    const mergedFavs = [
      ...localFavs,
      ...gistFavs
        .filter((g) => !localFavs.find((l) => l.name === g.name))
        .map((g) => ({ ...g, addedAt: g.addedAt ?? now })),
    ]
    await favoritesStorage.replace(mergedFavs)
    queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })

    const localMaintainers = await maintainersStorage.getAll()
    const mergedMaintainers = [
      ...localMaintainers,
      ...gistMaintainers
        .filter((g) => !localMaintainers.find((l) => l.username === g.username))
        .map((g) => ({ ...g, addedAt: g.addedAt ?? now })),
    ]
    await maintainersStorage.replace(mergedMaintainers)
    queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY })

    await settingsStorage.set(gistSettings)
    queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })

    const content = JSON.stringify({ favorites: mergedFavs, maintainers: mergedMaintainers, settings: gistSettings }, null, 2)
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } })
    setStatus('done')
  }

  async function resolveReplaceWithLocal() {
    if (!user?.githubToken || !gistId) return
    const [favorites, maintainers, settings] = await Promise.all([
      favoritesStorage.getAll(),
      maintainersStorage.getAll(),
      settingsStorage.get(),
    ])
    const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } })
    setStatus('done')
  }

  return { status, delta, gistFavorites: gistFavs, gistMaintainers, resolveKeepAll, resolveReplaceWithLocal }
}
