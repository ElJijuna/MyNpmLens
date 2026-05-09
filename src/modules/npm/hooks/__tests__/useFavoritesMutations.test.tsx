import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../useFavorites'
import { favoritesStorage } from '@/store/favorites'

jest.mock('@/modules/gist/hooks', () => ({
  usePushToGist: () => ({ mutate: jest.fn() }),
}))

// Share one QueryClient per test so mutations invalidate the same cache
function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

beforeEach(() => localStorage.clear())

describe('useAddFavorite', () => {
  it('adds a package and invalidates favorites query', async () => {
    const wrapper = makeWrapper()
    const { result: favResult } = renderHook(() => useFavorites(), { wrapper })
    const { result: addResult } = renderHook(() => useAddFavorite(), { wrapper })

    await waitFor(() => expect(favResult.current.isSuccess).toBe(true))
    expect(favResult.current.data).toHaveLength(0)

    act(() => { addResult.current.mutate('react') })

    await waitFor(() => expect(favResult.current.data).toHaveLength(1))
    expect(favResult.current.data![0].name).toBe('react')
  })

  it('does not duplicate an existing package', async () => {
    const wrapper = makeWrapper()
    const { result: addResult } = renderHook(() => useAddFavorite(), { wrapper })
    const { result: favResult } = renderHook(() => useFavorites(), { wrapper })

    act(() => { addResult.current.mutate('react') })
    await waitFor(() => expect(favResult.current.data).toHaveLength(1))

    act(() => { addResult.current.mutate('react') })
    await waitFor(() => expect(addResult.current.isSuccess).toBe(true))
    expect(favResult.current.data).toHaveLength(1)
  })
})

describe('useRemoveFavorite', () => {
  it('removes a package and invalidates favorites query', async () => {
    await favoritesStorage.replace([{ name: 'react', addedAt: '2024-01-01T00:00:00.000Z' }])
    const wrapper = makeWrapper()
    const { result: favResult } = renderHook(() => useFavorites(), { wrapper })
    const { result: removeResult } = renderHook(() => useRemoveFavorite(), { wrapper })

    await waitFor(() => expect(favResult.current.data).toHaveLength(1))

    act(() => { removeResult.current.mutate('react') })

    await waitFor(() => expect(favResult.current.data).toHaveLength(0))
  })
})
