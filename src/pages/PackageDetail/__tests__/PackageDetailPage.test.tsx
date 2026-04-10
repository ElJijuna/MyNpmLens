import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import * as npmHooks from '@/modules/npm/hooks'
import * as osvHooks from '@/modules/osv/hooks/useOsvVulnerabilities'
import * as githubHooks from '@/modules/github/hooks'
import { PackageDetailPage } from '../index'

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: jest.fn() } }),
  useNavigate: () => jest.fn(),
}))

jest.mock('@/routes/package.$name', () => ({
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
  version: '19.0.0',
  versions: ['19.0.0', '18.3.1'],
  distTags: { latest: '19.0.0' },
  description: 'A JavaScript library for building user interfaces.',
  license: 'MIT',
  homepage: 'https://reactjs.org/',
  author: { name: 'Meta', email: null, url: null },
  repository: { type: 'git', url: 'https://github.com/facebook/react.git', github: { owner: 'facebook', repo: 'react' } },
}

describe('PackageDetailPage', () => {
  beforeEach(() => {
    jest.spyOn(npmHooks, 'useNpmPackage').mockReturnValue({ isPending: false, data: MOCK_PKG, error: null } as unknown as ReturnType<typeof npmHooks.useNpmPackage>)
    jest.spyOn(npmHooks, 'useNpmDownloads').mockReturnValue({ isLisPendingoading: false, data: { packageName: 'react', weekly: 1_000_000, monthly: 4_000_000 }, error: null } as unknown as ReturnType<typeof npmHooks.useNpmDownloads>)
    jest.spyOn(npmHooks, 'useBundleSize').mockReturnValue({ isPending: false, data: { packageName: 'react', version: '19.0.0', size: 11_000, gzip: 4_200, hasSideEffects: false }, error: null } as unknown as ReturnType<typeof npmHooks.useBundleSize>)
    jest.spyOn(npmHooks, 'useRemoveFavorite').mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<typeof npmHooks.useRemoveFavorite>)
    jest.spyOn(githubHooks, 'useGitHubStats').mockReturnValue({ isPending: false, data: { owner: 'facebook', repo: 'react', stars: 230_000, forks: 47_000, openIssues: 850, lastPushedAt: '2024-12-01T10:00:00Z', htmlUrl: 'https://github.com/facebook/react' }, error: null } as unknown as ReturnType<typeof githubHooks.useGitHubStats>)
    jest.spyOn(osvHooks, 'useOsvVulnerabilities').mockReturnValue({ isPending: false, data: [], error: null } as unknown as ReturnType<typeof osvHooks.useOsvVulnerabilities>)
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

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('renders download numbers', () => {
    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('1.00M')).toBeInTheDocument()
    expect(screen.getByText('4.00M')).toBeInTheDocument()
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
    jest.spyOn(npmHooks, 'useNpmDownloads').mockReturnValue({
      isPending: false,
      data: undefined,
      error: new Error('API unavailable'),
    } as unknown as ReturnType<typeof npmHooks.useNpmDownloads>)

    render(<PackageDetailPage />, { wrapper })

    expect(screen.getByText('API unavailable')).toBeInTheDocument()
  })
})
