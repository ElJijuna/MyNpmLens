import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useGitHubStats } from '@/modules/github/hooks'
import * as ghApiHooks from '@api-hooks/gh'

const MOCK_REPO = {
  stargazers_count: 230_000,
  forks_count: 47_000,
  open_issues_count: 850,
  pushed_at: '2024-12-01T10:00:00Z',
  html_url: 'https://github.com/facebook/react',
  topics: ['javascript', 'ui'],
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('useGitHubStats', () => {
  it('maps GitHubRepository to GitHubStats on success', async () => {
    jest.spyOn(ghApiHooks, 'useGhRepo').mockReturnValue({
      data: MOCK_REPO,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
      fetchStatus: 'idle',
    } as ReturnType<typeof ghApiHooks.useGhRepo>)

    const { result } = renderHook(() => useGitHubStats('facebook', 'react'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.stars).toBe(230_000)
    expect(result.current.data?.topics).toEqual(['javascript', 'ui'])
  })

  it('is disabled when owner is null', () => {
    const { result } = renderHook(() => useGitHubStats(null, null), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('returns error state when useGhRepo reports error', async () => {
    jest.spyOn(ghApiHooks, 'useGhRepo').mockReturnValue({
      data: undefined,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: new Error('rate limit'),
      fetchStatus: 'idle',
    } as unknown as ReturnType<typeof ghApiHooks.useGhRepo>)

    const { result } = renderHook(() => useGitHubStats('facebook', 'react'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
