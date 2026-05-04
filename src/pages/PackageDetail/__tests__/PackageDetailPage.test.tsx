import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import * as npmHooks from '@/modules/npm/hooks'
import * as npmApiHooks from '@api-hooks/npm'
import * as osvHooks from '@api-hooks/osv'
import * as bpHooks from '@api-hooks/bp'
import * as githubHooks from '@/modules/github/hooks'
import { PackageDetailPage } from '../index'

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: jest.fn() } }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/packages/react' }),
}))

jest.mock('@/routes/packages.$name', () => ({
  Route: {
    useParams: () => ({ name: 'react' }),
    useSearch: () => ({ version: undefined }),
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

const MOCK_PKG = {
  name: 'react',
  'dist-tags': { latest: '19.0.0' },
  versions: { '19.0.0': {}, '18.3.1': {} },
  description: 'A JavaScript library for building user interfaces.',
  license: 'MIT',
  homepage: 'https://reactjs.org/',
  repository: { type: 'git', url: 'https://github.com/facebook/react.git' },
  time: {},
}

const MOCK_PKG_VERSION = {
  name: 'react',
  version: '19.0.0',
  description: 'A JavaScript library for building user interfaces.',
  license: 'MIT',
  homepage: 'https://reactjs.org/',
  repository: { type: 'git', url: 'https://github.com/facebook/react.git' },
  dist: { tarball: 'https://registry.npmjs.org/react/-/react-19.0.0.tgz', shasum: '' },
}

describe('PackageDetailPage', () => {
  beforeEach(() => {
    jest.spyOn(npmApiHooks, 'useNpmPackage').mockReturnValue({ isPending: false, data: MOCK_PKG, error: null } as unknown as ReturnType<typeof npmApiHooks.useNpmPackage>)
    jest.spyOn(npmApiHooks, 'useNpmPackageVersion').mockReturnValue({ isPending: false, data: MOCK_PKG_VERSION, error: null } as unknown as ReturnType<typeof npmApiHooks.useNpmPackageVersion>)
    jest.spyOn(npmApiHooks, 'useNpmPackageVersionDownloads')
      .mockReturnValue({ isPending: false, data: { downloads: 1_000_000, package: 'react', version: '19.0.0', period: 'last-week' }, error: null } as unknown as ReturnType<typeof npmApiHooks.useNpmPackageVersionDownloads>)
    jest.spyOn(bpHooks, 'useBpPackageVersionSize').mockReturnValue({ isPending: false, data: { packageName: 'react', version: '19.0.0', size: 11_000, gzip: 4_200, hasSideEffects: false }, error: null } as unknown as ReturnType<typeof bpHooks.useBpPackageVersionSize>)
    jest.spyOn(npmHooks, 'useRemoveFavorite').mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<typeof npmHooks.useRemoveFavorite>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ isPending: false, data: { owner: 'facebook', repo: 'react', stars: 230_000, forks: 47_000, openIssues: 850, lastPushedAt: '2024-12-01T10:00:00Z', htmlUrl: 'https://github.com/facebook/react' }, error: null } as unknown as ReturnType<typeof githubHooks.useGitHubStats>)
    jest.spyOn(osvHooks, 'useOsvQuery').mockReturnValue({ isPending: false, data: { vulns: [] }, error: null } as unknown as ReturnType<typeof osvHooks.useOsvQuery>)
  })

  it('renders all section headings', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('Package info')).toBeInTheDocument()
    expect(screen.getByText('Downloads')).toBeInTheDocument()
    expect(screen.getByText('Bundle size')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders package name and license', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getAllByText('react').length).toBeGreaterThan(0)
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('renders download numbers', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('1.00M')).toBeInTheDocument()
  })

  it('renders bundle size', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('10.74 kB')).toBeInTheDocument()
    expect(screen.getByText('4.10 kB')).toBeInTheDocument()
  })

  it('renders github stats', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('230.0k')).toBeInTheDocument()
    expect(screen.getByText('47.0k')).toBeInTheDocument()
  })

  it('shows error banner in a section when query fails', () => {
    jest.spyOn(npmApiHooks, 'useNpmPackageVersionDownloads')
      .mockReset()
      .mockReturnValue({
        isPending: false,
        data: undefined,
        error: new Error('API unavailable'),
      } as unknown as ReturnType<typeof npmApiHooks.useNpmPackageVersionDownloads>)

    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText(/API unavailable/i)).toBeInTheDocument()
  })
})
