import { useQuery } from '@tanstack/react-query'
import { fetchNpmDownloads } from '@/modules/npm/proxy'
import { npmQueryKeys } from './queryKeys'

/**
 * Fetches and caches weekly/monthly download counts for a package.
 * Stale after 1 hour; download stats don't change that frequently.
 */
export function useNpmDownloads(name: string) {
  return useQuery({
    queryKey: npmQueryKeys.downloads(name),
    queryFn: () => fetchNpmDownloads(name),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    enabled: name.length > 0,
  })
}
