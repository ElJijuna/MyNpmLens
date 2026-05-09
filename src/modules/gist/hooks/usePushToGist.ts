import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { GitHubClient } from 'gh-api-client'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'
import { settingsStorage } from '@/store/settings'
import { getGistId, saveGistId } from '@/lib/db'

export const GIST_FILENAME = 'mynpmlens.json'

export function usePushToGist() {
  const { user } = useAuth()
  const client = useMemo(
    () => new GitHubClient(user?.githubToken ? { token: user.githubToken } : {}),
    [user?.githubToken],
  )

  return useMutation({
    mutationFn: async () => {
      if (!user?.githubToken) return

      const [favorites, maintainers, settings] = await Promise.all([
        favoritesStorage.getAll(),
        maintainersStorage.getAll(),
        settingsStorage.get(),
      ])
      const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)
      const files = { [GIST_FILENAME]: { content } }

      const storedId = await getGistId(user.uid)

      if (storedId) {
        await client.gist(storedId).update({ files })
      } else {
        const created = await client.createGist({
          description: 'MyNpmLens sync',
          public: false,
          files,
        })
        await saveGistId(user.uid, created.id)
      }
    },
  })
}
