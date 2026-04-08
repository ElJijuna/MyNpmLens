import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useBundleSize } from '../useBundleSize'
import * as proxy from '@/modules/npm/proxy'
import type { BundleSize } from '@/modules/npm/domain'

const MOCK: BundleSize = { packageName: 'react', version: '19.0.0', size: 11_000, gzip: 4_200, hasSideEffects: false }

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('useBundleSize', () => {
  it('returns bundle size data on success', async () => {
    jest.spyOn(proxy, 'fetchBundleSize').mockResolvedValueOnce(MOCK)
    const { result } = renderHook(() => useBundleSize('react'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.gzip).toBe(4_200)
  })

  it('is disabled when name is empty', () => {
    const { result } = renderHook(() => useBundleSize(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('returns error state when proxy throws', async () => {
    jest.spyOn(proxy, 'fetchBundleSize').mockRejectedValueOnce(new Error('not found'))
    const { result } = renderHook(() => useBundleSize('unknown-pkg'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
