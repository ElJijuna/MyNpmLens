import type { GitHubStats } from '@/modules/github/domain'
import { ProxyError } from '@/modules/npm/proxy/ProxyError'
import { fetchWithTimeout } from '@/modules/npm/proxy/fetchWithTimeout'

const SERVICE = 'github-api'

interface GitHubRepoResponse {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  html_url: string
}

/**
 * Fetches repository statistics from the GitHub API.
 * Does not require authentication for public repos, but is rate-limited to 60 req/h unauthenticated.
 * @throws {ProxyError} on non-200 responses, timeout, or network errors.
 */
export async function fetchGitHubStats(owner: string, repo: string, token?: string): Promise<GitHubStats> {
  const url = `https://api.github.com/repos/${owner}/${repo}`
  const init: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const res = await fetchWithTimeout(url, SERVICE, undefined, init)

  if (res.status === 404) {
    throw new ProxyError(SERVICE, 404, `GitHub repository "${owner}/${repo}" not found`)
  }
  if (res.status === 403 || res.status === 429) {
    throw new ProxyError(SERVICE, res.status, 'GitHub API rate limit exceeded')
  }
  if (!res.ok) {
    throw new ProxyError(SERVICE, res.status, `GitHub API responded with ${res.status}`)
  }

  const data: GitHubRepoResponse = await res.json()

  return {
    owner,
    repo,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    lastPushedAt: data.pushed_at,
    htmlUrl: data.html_url,
  }
}
