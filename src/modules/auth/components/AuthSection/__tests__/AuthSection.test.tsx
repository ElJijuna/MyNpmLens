import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { AuthSection } from '../index'

jest.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
  persistGithubToken: jest.fn(),
  clearGithubToken: jest.fn(),
}))

jest.mock('@/modules/auth/hooks', () => ({
  useSignIn: jest.fn(),
  useSignOut: jest.fn(),
}))

import { useAuth } from '@/modules/auth/AuthProvider'
import { useSignIn, useSignOut } from '@/modules/auth/hooks'

const mockUseAuth = useAuth as jest.Mock
const mockUseSignIn = useSignIn as jest.Mock
const mockUseSignOut = useSignOut as jest.Mock

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  mockUseSignIn.mockReturnValue({ mutate: jest.fn(), isPending: false })
  mockUseSignOut.mockReturnValue({ mutate: jest.fn(), isPending: false })
})

afterEach(() => jest.clearAllMocks())

describe('AuthSection', () => {
  it('renders nothing while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, authLoading: true })

    const { container } = render(<AuthSection />, { wrapper })
    expect(container.firstChild).toBeNull()
  })

  it('shows Sign in with GitHub button when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, authLoading: false })

    render(<AuthSection />, { wrapper })
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
  })

  it('calls signIn.mutate when Sign in button is clicked', () => {
    const mutate = jest.fn()
    mockUseAuth.mockReturnValue({ user: null, authLoading: false })
    mockUseSignIn.mockReturnValue({ mutate, isPending: false })

    render(<AuthSection />, { wrapper })
    fireEvent.click(screen.getByText('Sign in with GitHub'))
    expect(mutate).toHaveBeenCalledTimes(1)
  })

  it('disables Sign in button while pending', () => {
    mockUseAuth.mockReturnValue({ user: null, authLoading: false })
    mockUseSignIn.mockReturnValue({ mutate: jest.fn(), isPending: true })

    render(<AuthSection />, { wrapper })
    expect(screen.getByText('Sign in with GitHub').closest('button')).toBeDisabled()
  })

  it('shows display name when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '1', displayName: 'El Jijuna', email: 'a@b.com', photoURL: null, githubToken: 'tok' },
      authLoading: false,
    })

    render(<AuthSection />, { wrapper })
    expect(screen.getByText('El Jijuna')).toBeInTheDocument()
  })

  it('shows Sign out button when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '1', displayName: 'El Jijuna', email: null, photoURL: null, githubToken: 'tok' },
      authLoading: false,
    })

    render(<AuthSection />, { wrapper })
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('calls signOut.mutate when Sign out is clicked', () => {
    const mutate = jest.fn()
    mockUseAuth.mockReturnValue({
      user: { uid: '1', displayName: 'User', email: null, photoURL: null, githubToken: 'tok' },
      authLoading: false,
    })
    mockUseSignOut.mockReturnValue({ mutate, isPending: false })

    render(<AuthSection />, { wrapper })
    fireEvent.click(screen.getByText('Sign out'))
    expect(mutate).toHaveBeenCalledTimes(1)
  })
})
