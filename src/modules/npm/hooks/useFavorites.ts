import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesStorage } from '@/store/favorites'
import { usePushToGist } from '@/modules/gist/hooks'
import type { FavoritePackage } from '@/modules/npm/domain'

export const FAVORITES_QUERY_KEY = ['favorites'] as const

/**
 * Returns the list of favorite packages stored in localStorage.
 * React Query uses localStorage as the "server" — staleTime is Infinity
 * because the data only changes via our own mutations.
 */
export function useFavorites() {
  return useQuery<FavoritePackage[]>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => favoritesStorage.getAll(),
    staleTime: Infinity,
  })
}

/**
 * Adds a package to favorites, invalidates the favorites query, and pushes to Gist if authenticated.
 */
export function useAddFavorite() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()
  return useMutation({
    mutationFn: (name: string) => {
      favoritesStorage.add(name)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}

/**
 * Removes a package from favorites, invalidates the favorites query, and pushes to Gist if authenticated.
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()
  return useMutation({
    mutationFn: (name: string) => {
      favoritesStorage.remove(name)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}
