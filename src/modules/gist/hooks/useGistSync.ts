import { useGhCreateGist, useGhGist, useGhGists, useGhUpdateGist } from '@api-hooks/gh';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getGistId, saveGistId } from '@/lib/db';
import { useAuth } from '@/modules/auth/AuthProvider';
import type { GistDelta } from '@/modules/gist/domain';
import { parseGistContent, stringifyGistContent } from '@/modules/gist/domain/gistContent';
import type { FavoritePackage, FollowedMaintainer } from '@/modules/npm/domain';
import { FAVORITES_QUERY_KEY } from '@/modules/npm/hooks/useFavorites';
import { MAINTAINERS_QUERY_KEY } from '@/modules/npm/hooks/useMaintainers';
import type { AppSettings } from '@/modules/settings/domain';
import { DEFAULT_SETTINGS } from '@/modules/settings/domain';
import { SETTINGS_QUERY_KEY } from '@/modules/settings/hooks';
import { favoritesStorage } from '@/store/favorites';
import { maintainersStorage } from '@/store/maintainers';
import { settingsStorage } from '@/store/settings';
import { GIST_FILENAME } from './usePushToGist';

type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'done' | 'error';

interface GistSyncState {
  status: SyncStatus;
  delta: GistDelta;
  gistFavorites: FavoritePackage[];
  gistMaintainers: FollowedMaintainer[];
  resolveKeepAll: () => void;
  resolveReplaceWithLocal: () => void;
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
    addedMaintainersInGist: gistMaintainers.filter(
      (g) => !localMaintainers.find((l) => l.username === g.username),
    ),
    removedMaintainersInGist: localMaintainers.filter(
      (l) => !gistMaintainers.find((g) => g.username === l.username),
    ),
  };
}

export function useGistSync(): GistSyncState {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<SyncStatus>('idle');
  const [delta, setDelta] = useState<GistDelta>({
    addedInGist: [],
    removedInGist: [],
    addedMaintainersInGist: [],
    removedMaintainersInGist: [],
  });
  const [gistId, setGistId] = useState<string | null>(null);
  // true once we've read IndexedDB (prevents acting before the stored id is known)
  const [gistIdLoaded, setGistIdLoaded] = useState(false);
  const [gistFavs, setGistFavs] = useState<FavoritePackage[]>([]);
  const [gistMaintainers, setGistMaintainers] = useState<FollowedMaintainer[]>([]);
  const [gistSettings, setGistSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const createGist = useGhCreateGist();
  const updateGist = useGhUpdateGist(gistId ?? '');

  // Load stored gist id from IndexedDB whenever the logged-in user changes
  useEffect(() => {
    let cancelled = false;

    async function loadGistId() {
      if (!user?.uid) {
        setGistId(null);
        setGistIdLoaded(false);
        return;
      }

      setGistIdLoaded(false);
      const id = await getGistId(user.uid);
      if (cancelled) {
        return;
      }
      setGistId(id);
      setGistIdLoaded(true);
    }

    void loadGistId();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Trigger sync once after login (wait for IndexedDB read)
  useEffect(() => {
    if (!user?.githubToken || !gistIdLoaded) {
      if (!user?.githubToken) {
        setStatus('idle');
      }
      return;
    }
    setStatus('syncing');
  }, [user?.githubToken, gistIdLoaded]);

  // Search the user's gists only when no id is stored — runs at most once per login
  const { data: gistsList, isSuccess: listsLoaded } = useGhGists(
    { per_page: 100 },
    {
      enabled: gistIdLoaded && !gistId && status === 'syncing' && !!user?.githubToken,
    },
  );

  // When the gists list arrives, either reuse the existing gist or create a new one
  useEffect(() => {
    if (!listsLoaded || gistId || !user?.githubToken) {
      return;
    }

    let cancelled = false;
    const uid = user.uid;
    const found = gistsList?.values.find((g) => GIST_FILENAME in g.files);

    async function createSyncGist() {
      try {
        const [favorites, maintainers, settings] = await Promise.all([
          favoritesStorage.getAll(),
          maintainersStorage.getAll(),
          settingsStorage.get(),
        ]);

        if (cancelled) {
          return;
        }

        const content = stringifyGistContent({ favorites, maintainers, settings });
        createGist.mutate(
          { description: 'MyNpmLens sync', public: false, files: { [GIST_FILENAME]: { content } } },
          {
            onSuccess: (created) => {
              saveGistId(uid, created.id);
              setGistId(created.id);
              setStatus('done');
            },
            onError: () => setStatus('error'),
          },
        );
      } catch {
        setStatus('error');
      }
    }

    if (found) {
      saveGistId(uid, found.id);
      setGistId(found.id);
      // useGhGist picks up the new id and handles the rest
    } else {
      void createSyncGist();
    }

    return () => {
      cancelled = true;
    };
  }, [createGist, gistsList?.values, gistId, listsLoaded, user?.githubToken, user?.uid]);

  // Fetch the remote gist content once we have an id
  const {
    data: remoteGist,
    isSuccess: gistLoaded,
    isError: gistError,
  } = useGhGist(gistId ?? '', {
    enabled: !!gistId && !!user?.githubToken && status === 'syncing',
  });

  // Compare remote vs local and decide if there's a conflict
  useEffect(() => {
    if (!gistLoaded || !remoteGist) {
      return;
    }

    const gist = remoteGist;
    let cancelled = false;

    async function compareGist() {
      try {
        const raw = gist.files[GIST_FILENAME]?.content ?? '{}';
        const {
          favorites: remoteFavs,
          maintainers: remoteMaintainers,
          settings: remoteSettings,
        } = parseGistContent(raw);
        const [localFavs, localMaintainers] = await Promise.all([
          favoritesStorage.getAll(),
          maintainersStorage.getAll(),
        ]);

        if (cancelled) {
          return;
        }

        if (
          localFavs.length === 0 &&
          localMaintainers.length === 0 &&
          (remoteFavs.length > 0 || remoteMaintainers.length > 0)
        ) {
          const now = new Date().toISOString();
          await Promise.all([
            favoritesStorage.replace(remoteFavs.map((f) => ({ ...f, addedAt: f.addedAt ?? now }))),
            maintainersStorage.replace(
              remoteMaintainers.map((m) => ({ ...m, addedAt: m.addedAt ?? now })),
            ),
            settingsStorage.set(remoteSettings),
          ]);
          if (cancelled) {
            return;
          }
          queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
          setGistFavs(remoteFavs);
          setGistMaintainers(remoteMaintainers);
          setStatus('done');
          return;
        }

        const computed = computeDelta(localFavs, remoteFavs, localMaintainers, remoteMaintainers);

        const hasDiff =
          computed.addedInGist.length > 0 ||
          computed.removedInGist.length > 0 ||
          computed.addedMaintainersInGist.length > 0 ||
          computed.removedMaintainersInGist.length > 0;

        if (!hasDiff) {
          await settingsStorage.set(remoteSettings);
          if (cancelled) {
            return;
          }
          queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
          setStatus('done');
        } else {
          setGistFavs(remoteFavs);
          setGistMaintainers(remoteMaintainers);
          setGistSettings(remoteSettings);
          setDelta(computed);
          setStatus('conflict');
        }
      } catch {
        setStatus('error');
      }
    }

    void compareGist();

    return () => {
      cancelled = true;
    };
  }, [gistLoaded, queryClient, remoteGist]);

  useEffect(() => {
    if (gistError) {
      setStatus('error');
    }
  }, [gistError]);

  async function resolveKeepAll() {
    if (!user?.githubToken || !gistId) {
      return;
    }

    const localFavs = await favoritesStorage.getAll();
    const now = new Date().toISOString();
    const mergedFavs = [
      ...localFavs,
      ...gistFavs
        .filter((g) => !localFavs.find((l) => l.name === g.name))
        .map((g) => ({ ...g, addedAt: g.addedAt ?? now })),
    ];
    await favoritesStorage.replace(mergedFavs);
    queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });

    const localMaintainers = await maintainersStorage.getAll();
    const mergedMaintainers = [
      ...localMaintainers,
      ...gistMaintainers
        .filter((g) => !localMaintainers.find((l) => l.username === g.username))
        .map((g) => ({ ...g, addedAt: g.addedAt ?? now })),
    ];
    await maintainersStorage.replace(mergedMaintainers);
    queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY });

    await settingsStorage.set(gistSettings);
    queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });

    const content = stringifyGistContent({
      favorites: mergedFavs,
      maintainers: mergedMaintainers,
      settings: gistSettings,
    });
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } });
    setStatus('done');
  }

  async function resolveReplaceWithLocal() {
    if (!user?.githubToken || !gistId) {
      return;
    }
    const [favorites, maintainers, settings] = await Promise.all([
      favoritesStorage.getAll(),
      maintainersStorage.getAll(),
      settingsStorage.get(),
    ]);
    const content = stringifyGistContent({ favorites, maintainers, settings });
    updateGist.mutate({ files: { [GIST_FILENAME]: { content } } });
    setStatus('done');
  }

  return {
    status,
    delta,
    gistFavorites: gistFavs,
    gistMaintainers,
    resolveKeepAll,
    resolveReplaceWithLocal,
  };
}
