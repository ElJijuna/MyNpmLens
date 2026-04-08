import { useQuery } from '@tanstack/react-query'
import { fetchBundleSize } from '@/modules/npm/proxy'
import { npmQueryKeys } from './queryKeys'

/**
 * Fetches and caches bundle size metrics from Bundlephobia.
 * Stale after 24 hours; bundle size only changes on new releases.
 */
export function useBundleSize(name: string) {
  return useQuery({
    queryKey: npmQueryKeys.bundleSize(name),
    queryFn: () => fetchBundleSize(name),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: name.length > 0,
  })
}
