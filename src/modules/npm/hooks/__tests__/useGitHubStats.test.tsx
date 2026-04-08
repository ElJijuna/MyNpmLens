import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useGitHubStats } from '@/modules/github/hooks'
import * as proxy from '@/modules/github/proxy'
import type { GitHubStats } from '@/modules/github/domain'

const MOCK_STATS: GitHubStats = {
  owner: 'facebook',
  repo: 'react',
  stars: 230_000,
  forks: 47_000,
  openIssues: 850,
  lastPushedAt: '2024-12-01T10:00:00Z',
  htmlUrl: 'https://github.com/facebook/react',
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('useGitHubStats', () => {
  it('returns data on success', async () => {
    jest.spyOn(proxy, 'fetchGitHubStats').mockResolvedValueOnce(MOCK_STATS)

    const { result } = renderHook(() => useGitHubStats('facebook', 'react'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.stars).toBe(230_000)
  })

  it('is disabled when owner is null', () => {
    const { result } = renderHook(() => useGitHubStats(null, null), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('returns error state when proxy throws', async () => {
    jest.spyOn(proxy, 'fetchGitHubStats').mockRejectedValueOnce(new Error('rate limit'))

    const { result } = renderHook(() => useGitHubStats('facebook', 'react'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
