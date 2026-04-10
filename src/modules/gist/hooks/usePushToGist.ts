import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/modules/auth/AuthProvider'
import { favoritesStorage } from '@/store/favorites'
import { createUserGist, updateUserGist } from '@/modules/gist/proxy'

const GIST_ID_PREFIX = 'mynpmlens:gist:'

export function getStoredGistId(uid: string): string | null {
  return localStorage.getItem(`${GIST_ID_PREFIX}${uid}`)
}

export function setStoredGistId(uid: string, gistId: string): void {
  localStorage.setItem(`${GIST_ID_PREFIX}${uid}`, gistId)
}

/**
 * Pushes the current local favorites to the user's Gist.
 * Creates the Gist on first push if it doesn't exist yet.
 * Fails silently — local data is always the source of truth.
 */
export function usePushToGist() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user?.githubToken) return

      const favorites = favoritesStorage.getAll()
      const gistId = getStoredGistId(user.uid)

      if (!gistId) {
        const created = await createUserGist(favorites, user.githubToken)
        setStoredGistId(user.uid, created.gistId)
      } else {
        await updateUserGist(gistId, favorites, user.githubToken)
      }
    },
  })
}
