import { useMutation } from '@tanstack/react-query'
import { useGhCreateGist, useGhUpdateGist } from '@api-hooks/gh'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'
import { settingsStorage } from '@/store/settings'
import { getGistId, saveGistId } from '@/lib/db'

export const GIST_FILENAME = 'mynpmlens.json'

export function usePushToGist() {
  const { user } = useAuth()

  const createGist = useGhCreateGist({ token: user?.githubToken })
  const updateGist = useGhUpdateGist('', { token: user?.githubToken })

  return useMutation({
    mutationFn: async () => {
      if (!user?.githubToken) return

      const favorites = favoritesStorage.getAll()
      const maintainers = maintainersStorage.getAll()
      const settings = settingsStorage.get()
      const content = JSON.stringify({ favorites, maintainers, settings }, null, 2)
      const files = { [GIST_FILENAME]: { content } }

      const storedId = await getGistId(user.uid)

      if (storedId) {
        await updateGist.mutateAsync({ files })
      } else {
        const created = await createGist.mutateAsync({
          description: 'MyNpmLens sync',
          public: false,
          files,
        })
        await saveGistId(user.uid, created.id)
      }
    },
  })
}
