import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { PackageCard } from '../index'
import * as npmApiHooks from '@api-hooks/npm'
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
    jest.spyOn(npmApiHooks, 'useNpmPackage').mockReturnValue({ isPending: true } as ReturnType<typeof npmApiHooks.useNpmPackage>)
    jest.spyOn(npmApiHooks, 'useNpmPackageDownloads').mockReturnValue({ data: undefined } as ReturnType<typeof npmApiHooks.useNpmPackageDownloads>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ data: undefined } as ReturnType<typeof githubHooks.useGitHubStats>)

    const { container } = render(<PackageCard name="react" />, { wrapper })
    expect(container.firstChild).toBeTruthy()
  })

  it('renders package info when loaded', () => {
    jest.spyOn(npmApiHooks, 'useNpmPackage').mockReturnValue({
      isPending: false,
      data: {
        name: 'react',
        'dist-tags': { latest: '19.0.0' },
        versions: { '19.0.0': {}, '18.3.1': {}, '18.0.0': {} },
        description: 'A JavaScript library.',
        license: 'MIT',
        homepage: null,
        repository: null,
        time: {},
      },
    } as unknown as ReturnType<typeof npmApiHooks.useNpmPackage>)
    jest.spyOn(npmApiHooks, 'useNpmPackageDownloads').mockReturnValue({
      data: { downloads: 50_000_000, start: '', end: '', package: 'react' },
    } as unknown as ReturnType<typeof npmApiHooks.useNpmPackageDownloads>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ data: undefined } as ReturnType<typeof githubHooks.useGitHubStats>)

    render(<PackageCard name="react" />, { wrapper })

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(screen.getByText('v19.0.0 · 3 versions')).toBeInTheDocument()
    expect(screen.getByText('A JavaScript library.')).toBeInTheDocument()
    expect(screen.getByText('↓ 50M/wk')).toBeInTheDocument()
  })
})
