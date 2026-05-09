import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesStorage } from '@/store/favorites'
import { usePushToGist } from '@/modules/gist/hooks'
import type { FavoritePackage } from '@/modules/npm/domain'

export const FAVORITES_QUERY_KEY = ['favorites'] as const

export function useFavorites() {
  return useQuery<FavoritePackage[]>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => favoritesStorage.getAll(),
    staleTime: Infinity,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()
  return useMutation({
    mutationFn: (name: string) => favoritesStorage.add(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()
  return useMutation({
    mutationFn: (name: string) => favoritesStorage.remove(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}
