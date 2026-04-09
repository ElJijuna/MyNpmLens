import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useNpmPackage } from '../useNpmPackage'
import * as proxy from '@/modules/npm/proxy'
import type { NpmPackage } from '@/modules/npm/domain'

const MOCK_PACKAGE: NpmPackage = {
  name: 'react',
  version: '19.0.0',
  versions: ['19.0.0', '18.3.1'],
  distTags: { latest: '19.0.0' },
  description: 'A JavaScript library for building user interfaces.',
  license: 'MIT',
  homepage: 'https://reactjs.org/',
  author: { name: 'Meta', email: null, url: null },
  repository: {
    type: 'git',
    url: 'https://github.com/facebook/react.git',
    github: { owner: 'facebook', repo: 'react' },
  },
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('useNpmPackage', () => {
  it('returns data on success', async () => {
    jest.spyOn(proxy, 'fetchNpmPackage').mockResolvedValueOnce(MOCK_PACKAGE)

    const { result } = renderHook(() => useNpmPackage('react'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_PACKAGE)
  })

  it('returns error state when proxy throws', async () => {
    jest.spyOn(proxy, 'fetchNpmPackage').mockRejectedValueOnce(new Error('not found'))

    const { result } = renderHook(() => useNpmPackage('bad-pkg'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('is disabled when name is empty', () => {
    const { result } = renderHook(() => useNpmPackage(''), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
