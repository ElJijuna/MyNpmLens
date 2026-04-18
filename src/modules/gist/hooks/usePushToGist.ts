import { useMutation } from '@tanstack/react-query'
import { useGhCreateGist, useGhUpdateGist } from '@api-hooks/gh'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { maintainersStorage } from '@/store/maintainers'

export const GIST_FILENAME = 'mynpmlens.json'
const GIST_ID_PREFIX = 'mynpmlens:gist:'

export function getStoredGistId(uid: string): string | null {
  return localStorage.getItem(`${GIST_ID_PREFIX}${uid}`)
}

export function setStoredGistId(uid: string, gistId: string): void {
  localStorage.setItem(`${GIST_ID_PREFIX}${uid}`, gistId)
}

export function usePushToGist() {
  const { user } = useAuth()
  const gistId = user ? getStoredGistId(user.uid) : null

  const createGist = useGhCreateGist({ token: user?.githubToken })
  const updateGist = useGhUpdateGist(gistId ?? '', { token: user?.githubToken })

  return useMutation({
    mutationFn: async () => {
      if (!user?.githubToken) return

      const favorites = favoritesStorage.getAll()
      const maintainers = maintainersStorage.getAll()
      const content = JSON.stringify({ favorites, maintainers }, null, 2)
      const files = { [GIST_FILENAME]: { content } }
      const currentGistId = getStoredGistId(user.uid)

      if (!currentGistId) {
        const created = await createGist.mutateAsync({
          description: 'MyNpmLens sync',
          public: false,
          files,
        })
        setStoredGistId(user.uid, created.id)
      } else {
        await updateGist.mutateAsync({ files })
      }
    },
  })
}
