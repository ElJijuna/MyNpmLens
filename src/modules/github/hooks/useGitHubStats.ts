import { useQuery } from '@tanstack/react-query'
import { fetchGitHubStats } from '@/modules/github/proxy'
import { useAuth } from '@/modules/auth/AuthProvider'
import { githubQueryKeys } from './queryKeys'

/**
 * Fetches and caches GitHub repository statistics.
 * Stale after 1 hour. Pass null for owner/repo to disable the query when
 * the package has no GitHub repository.
 * When the user is authenticated the GitHub token is forwarded,
 * raising the rate limit from 60 → 5,000 req/h.
 */
export function useGitHubStats(owner: string | null, repo: string | null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: githubQueryKeys.stats(owner ?? '', repo ?? ''),
    queryFn: () => fetchGitHubStats(owner!, repo!, user?.githubToken),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    enabled: owner !== null && repo !== null,
  })
}
