import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

jest.mock('@/modules/gist/proxy', () => ({
  fetchUserGist: jest.fn(),
  findUserGist: jest.fn(),
  createUserGist: jest.fn(),
  updateUserGist: jest.fn(),
}))

jest.mock('@/modules/gist/hooks/usePushToGist', () => ({
  getStoredGistId: jest.fn(),
  setStoredGistId: jest.fn(),
}))

import { useGistSync } from '../useGistSync'
import { fetchUserGist, findUserGist, createUserGist, updateUserGist } from '@/modules/gist/proxy'
import { getStoredGistId, setStoredGistId } from '@/modules/gist/hooks/usePushToGist'
import { useAuth } from '@/modules/auth/AuthProvider'

const mockFetchUserGist = fetchUserGist as jest.Mock
const mockFindUserGist = findUserGist as jest.Mock
const mockCreateUserGist = createUserGist as jest.Mock
const mockUpdateUserGist = updateUserGist as jest.Mock
const mockGetStoredGistId = getStoredGistId as jest.Mock
const mockSetStoredGistId = setStoredGistId as jest.Mock
const mockUseAuth = useAuth as jest.Mock

const AUTHED_USER = { uid: 'u1', displayName: 'Test', email: null, photoURL: null, githubToken: 'tok' }
const GIST_ID = 'gist123'
const LOCAL_FAV = { name: 'react', addedAt: '2025-01-01T00:00:00Z' }
const REMOTE_FAV = { name: 'lodash', addedAt: '2025-01-01T00:00:00Z' }

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: null, authLoading: false })
})

describe('useGistSync — not authenticated', () => {
  it('stays idle when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, authLoading: false })
    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })
    expect(result.current.status).toBe('idle')
  })
})

describe('useGistSync — first login, no gist exists', () => {
  it('creates a new gist and sets status to done', async () => {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(null)
    mockFindUserGist.mockResolvedValue(null)
    mockCreateUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [LOCAL_FAV], updatedAt: '' })

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('done'))
    expect(mockCreateUserGist).toHaveBeenCalledWith([LOCAL_FAV], 'tok')
    expect(mockSetStoredGistId).toHaveBeenCalledWith('u1', GIST_ID)
  })
})

describe('useGistSync — first login, existing gist found', () => {
  it('sets status to done when local and remote are equal', async () => {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(null)
    mockFindUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [LOCAL_FAV], updatedAt: '' })

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('done'))
    expect(mockSetStoredGistId).toHaveBeenCalledWith('u1', GIST_ID)
    expect(mockCreateUserGist).not.toHaveBeenCalled()
  })

  it('sets status to conflict when remote has different packages', async () => {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(null)
    mockFindUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [REMOTE_FAV], updatedAt: '' })

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('conflict'))
    expect(result.current.delta.addedInGist[0].name).toBe('lodash')
    expect(result.current.delta.removedInGist[0].name).toBe('react')
  })
})

describe('useGistSync — returning device with stored gistId', () => {
  it('sets status to done when local and remote are equal', async () => {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(GIST_ID)
    mockFetchUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [LOCAL_FAV], updatedAt: '' })

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('done'))
    expect(mockFindUserGist).not.toHaveBeenCalled()
  })

  it('sets status to conflict when remote differs', async () => {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(GIST_ID)
    mockFetchUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [REMOTE_FAV], updatedAt: '' })

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('conflict'))
  })
})

describe('useGistSync — error handling', () => {
  it('sets status to error when fetch throws', async () => {
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(GIST_ID)
    mockFetchUserGist.mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.status).toBe('error'))
  })
})

describe('useGistSync — resolvers', () => {
  async function setupConflict() {
    localStorage.setItem('mynpmlens:favorites', JSON.stringify([LOCAL_FAV]))
    mockUseAuth.mockReturnValue({ user: AUTHED_USER, authLoading: false })
    mockGetStoredGistId.mockReturnValue(GIST_ID)
    mockFetchUserGist.mockResolvedValue({ gistId: GIST_ID, favorites: [REMOTE_FAV], updatedAt: '' })
    mockUpdateUserGist.mockResolvedValue(undefined)

    const { result } = renderHook(() => useGistSync(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.status).toBe('conflict'))
    return result
  }

  it('resolveKeepAll merges and sets status to done', async () => {
    const result = await setupConflict()

    result.current.resolveKeepAll()

    await waitFor(() => expect(result.current.status).toBe('done'))
    const stored = JSON.parse(localStorage.getItem('mynpmlens:favorites')!)
    const names = stored.map((f: { name: string }) => f.name)
    expect(names).toContain('react')
    expect(names).toContain('lodash')
    expect(mockUpdateUserGist).toHaveBeenCalled()
  })

  it('resolveReplaceWithLocal keeps local and sets status to done', async () => {
    const result = await setupConflict()

    result.current.resolveReplaceWithLocal()

    await waitFor(() => expect(result.current.status).toBe('done'))
    expect(mockUpdateUserGist).toHaveBeenCalledWith(GIST_ID, [LOCAL_FAV], 'tok')
  })
})
