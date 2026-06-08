import { useGhRepo } from '@api-hooks/gh';
import { useMemo } from 'react';
import type { GitHubStats } from '@/modules/github/domain';

/**
 * Fetches and caches GitHub repository statistics via useGhRepo.
 * Pass null for owner/repo to disable the query when the package has no GitHub repository.
 * When the user is authenticated the GitHub token is forwarded,
 * raising the rate limit from 60 → 5,000 req/h.
 */
export function useGitHubStats(owner: string | null, repo: string | null) {
  const query = useGhRepo(owner ?? '', repo ?? '', {
    enabled: owner !== null && repo !== null,
  });

  const data = useMemo<GitHubStats | undefined>(() => {
    if (!query.data || !owner || !repo) {
      return undefined;
    }
    const r = query.data;
    return {
      owner,
      repo,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      lastPushedAt: r.pushed_at ?? '',
      htmlUrl: r.html_url,
      topics: r.topics,
    };
  }, [query.data, owner, repo]);

  return { ...query, data };
}
