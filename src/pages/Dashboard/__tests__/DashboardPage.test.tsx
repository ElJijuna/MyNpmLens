import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { DashboardPage } from '../index'
import * as npmHooks from '@/modules/npm/hooks'

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: jest.fn() } }),
  useNavigate: () => jest.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => localStorage.clear())
afterEach(() => jest.restoreAllMocks())

describe('DashboardPage', () => {
  it('shows EmptyState when favorites list is empty', async () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>)

    render(<DashboardPage />, { wrapper })
    expect(screen.getByText('No packages yet')).toBeInTheDocument()
  })

  it('renders package cards when favorites exist', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [
        { name: 'react', addedAt: '2024-01-01T00:00:00.000Z' },
        { name: 'lodash', addedAt: '2024-01-02T00:00:00.000Z' },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>)
    jest.spyOn(npmHooks, 'useNpmPackage').mockReturnValue({ isLoading: true } as ReturnType<typeof npmHooks.useNpmPackage>)
    jest.spyOn(npmHooks, 'useNpmDownloads').mockReturnValue({ data: undefined } as ReturnType<typeof npmHooks.useNpmDownloads>)
    jest.spyOn(npmHooks, 'useBundleSize').mockReturnValue({ data: undefined } as ReturnType<typeof npmHooks.useBundleSize>)

    render(<DashboardPage />, { wrapper })
    expect(screen.queryByText('No packages yet')).not.toBeInTheDocument()
  })

  it('shows the Add package modal when toolbar button is clicked', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>)

    render(<DashboardPage />, { wrapper })
    // Toolbar "Add package" button contains text — find it directly
    const addBtn = screen.getAllByText(/add package/i)[0]
    fireEvent.click(addBtn.closest('button')!)
    // Dialog title rendered (aria-hidden backdrop, use getAllByText)
    expect(screen.getAllByText(/add package/i).length).toBeGreaterThan(1)
  })
})
