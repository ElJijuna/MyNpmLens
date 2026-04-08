import { useQuery } from '@tanstack/react-query'
import { fetchNpmPackage } from '@/modules/npm/proxy'
import { npmQueryKeys } from './queryKeys'

/**
 * Fetches and caches npm registry metadata for a package.
 * Stale after 5 minutes; cached for 30 minutes.
 */
export function useNpmPackage(name: string) {
  return useQuery({
    queryKey: npmQueryKeys.package(name),
    queryFn: () => fetchNpmPackage(name),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: name.length > 0,
  })
}
