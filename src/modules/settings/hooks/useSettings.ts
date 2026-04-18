import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsStorage } from '@/store/settings'
import { usePushToGist } from '@/modules/gist/hooks'
import type { AppSettings } from '@/modules/settings/domain'

export const SETTINGS_QUERY_KEY = ['settings'] as const

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => settingsStorage.get(),
    staleTime: Infinity,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()

  return useMutation({
    mutationFn: (partial: Partial<AppSettings>) => {
      const current = settingsStorage.get()
      settingsStorage.set({ ...current, ...partial })
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}
