import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintainersStorage } from '@/store/maintainers'
import { fetchWithTimeout } from '@/modules/npm/proxy/fetchWithTimeout'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { usePushToGist } from '@/modules/gist/hooks'
import type { FollowedMaintainer } from '@/modules/npm/domain'

export const MAINTAINERS_QUERY_KEY = ['maintainers'] as const

export function useMaintainers() {
  return useQuery<FollowedMaintainer[]>({
    queryKey: MAINTAINERS_QUERY_KEY,
    queryFn: () => maintainersStorage.getAll(),
    staleTime: Infinity,
  })
}

async function validateMaintainer(username: string): Promise<void> {
  const url = `https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(username)}&size=1`
  const res = await fetchWithTimeout(url, 'npm-registry')
  if (!res.ok) throw new ProxyError('npm-registry', res.status, `npm registry responded with ${res.status}`)
  const data: { total: number } = await res.json()
  if (data.total === 0) throw new ProxyError('npm-registry', 404, `Maintainer "${username}" not found on npm`)
}

export function useAddMaintainer() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()

  return useMutation({
    mutationFn: async (username: string) => {
      await validateMaintainer(username)
      await maintainersStorage.add(username)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}

export function useRemoveMaintainer() {
  const queryClient = useQueryClient()
  const pushToGist = usePushToGist()

  return useMutation({
    mutationFn: (username: string) => maintainersStorage.remove(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTAINERS_QUERY_KEY })
      pushToGist.mutate()
    },
  })
}
