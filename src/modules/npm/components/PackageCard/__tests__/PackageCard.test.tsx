import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { PackageCard } from '../index'
import * as npmHooks from '@/modules/npm/hooks'
import * as githubHooks from '@/modules/github/hooks'

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => jest.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('PackageCard', () => {
  it('shows a spinner while loading', () => {
    jest.spyOn(npmHooks, 'useNpmPackage').mockReturnValue({ isLoading: true } as ReturnType<typeof npmHooks.useNpmPackage>)
    jest.spyOn(npmHooks, 'useNpmDownloads').mockReturnValue({ data: undefined } as ReturnType<typeof npmHooks.useNpmDownloads>)
    jest.spyOn(npmHooks, 'useBundleSize').mockReturnValue({ data: undefined } as ReturnType<typeof npmHooks.useBundleSize>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ data: undefined } as ReturnType<typeof githubHooks.useGitHubStats>)

    const { container } = render(<PackageCard name="react" />, { wrapper })
    expect(container.firstChild).toBeTruthy()
  })

  it('renders package info when loaded', () => {
    jest.spyOn(npmHooks, 'useNpmPackage').mockReturnValue({
      isLoading: false,
      data: {
        name: 'react',
        version: '19.0.0',
        versions: ['19.0.0', '18.3.1', '18.0.0'],
        distTags: { latest: '19.0.0' },
        description: 'A JavaScript library.',
        license: 'MIT',
        homepage: null,
        author: null,
        repository: null,
      },
    } as unknown as ReturnType<typeof npmHooks.useNpmPackage>)
    jest.spyOn(npmHooks, 'useNpmDownloads').mockReturnValue({
      data: { packageName: 'react', weekly: 50_000_000, monthly: 200_000_000 },
    } as ReturnType<typeof npmHooks.useNpmDownloads>)
    jest.spyOn(npmHooks, 'useBundleSize').mockReturnValue({
      data: { packageName: 'react', version: '19.0.0', size: 11000, gzip: 4200, hasSideEffects: false },
    } as ReturnType<typeof npmHooks.useBundleSize>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ data: undefined } as ReturnType<typeof githubHooks.useGitHubStats>)

    render(<PackageCard name="react" />, { wrapper })

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(screen.getByText('v19.0.0')).toBeInTheDocument()
    expect(screen.getByText('A JavaScript library.')).toBeInTheDocument()
    expect(screen.getByText('↓ 50.0M/wk')).toBeInTheDocument()
    expect(screen.getByText('⬡ 4.1 kB gz')).toBeInTheDocument()
  })
})
