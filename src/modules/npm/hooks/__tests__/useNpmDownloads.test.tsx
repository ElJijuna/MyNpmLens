import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useNpmDownloads } from '../useNpmDownloads'
import * as proxy from '@/modules/npm/proxy'
import type { NpmDownloads } from '@/modules/npm/domain'

const MOCK: NpmDownloads = { packageName: 'lodash', weekly: 50_000_000, monthly: 200_000_000 }

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('useNpmDownloads', () => {
  it('returns download data on success', async () => {
    jest.spyOn(proxy, 'fetchNpmDownloads').mockResolvedValueOnce(MOCK)
    const { result } = renderHook(() => useNpmDownloads('lodash'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK)
  })

  it('is disabled when name is empty', () => {
    const { result } = renderHook(() => useNpmDownloads(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('returns error state when proxy throws', async () => {
    jest.spyOn(proxy, 'fetchNpmDownloads').mockRejectedValueOnce(new Error('unavailable'))
    const { result } = renderHook(() => useNpmDownloads('lodash'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
