import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { DownloadsChart } from '../index'

jest.mock('@gnome-ui/charts', () => ({
  BarChart: ({ data, xAxisKey, series }: { data: Record<string, unknown>[]; xAxisKey: string; series: { dataKey: string; name: string }[] }) => (
    <div data-testid="bar-chart">
      {data.map((row) => (
        <div key={String(row[xAxisKey])} data-testid={`row-${String(row[xAxisKey])}`}>
          {series.map((s) => (
            <span key={s.dataKey} data-testid={`${String(row[xAxisKey])}-${s.dataKey}`}>
              {String(row[s.dataKey])}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: jest.fn(),
}))

import { useQueries } from '@tanstack/react-query'
const mockUseQueries = useQueries as jest.Mock

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('DownloadsChart', () => {
  it('renders nothing when no package has data yet', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined },
      { data: undefined },
      { data: undefined },
      { data: undefined },
    ])

    const { container } = render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })
    expect(container.firstChild).toBeNull()
  })

  it('renders the chart as soon as at least one package has data', () => {
    mockUseQueries.mockReturnValue([
      { data: { downloads: 50_000_000 } },
      { data: { downloads: 200_000_000 } },
      { data: undefined },
      { data: undefined },
    ])

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows the Downloads heading', () => {
    mockUseQueries.mockReturnValue([
      { data: { downloads: 1000 } },
      { data: { downloads: 4000 } },
    ])

    render(<DownloadsChart packageNames={['react']} />, { wrapper })
    expect(screen.getByText('Downloads')).toBeInTheDocument()
  })

  it('passes correct weekly and monthly values to the chart', () => {
    mockUseQueries.mockReturnValue([
      { data: { downloads: 5000 } },
      { data: { downloads: 20000 } },
      { data: { downloads: 3000 } },
      { data: { downloads: 12000 } },
    ])

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })

    expect(screen.getByTestId('react-weekly').textContent).toBe('5000')
    expect(screen.getByTestId('react-monthly').textContent).toBe('20000')
    expect(screen.getByTestId('lodash-weekly').textContent).toBe('3000')
    expect(screen.getByTestId('lodash-monthly').textContent).toBe('12000')
  })

  it('defaults missing data to 0 instead of crashing', () => {
    mockUseQueries.mockReturnValue([
      { data: { downloads: 1000 } },
      { data: { downloads: 4000 } },
      { data: undefined },
      { data: undefined },
    ])

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })

    expect(screen.getByTestId('lodash-weekly').textContent).toBe('0')
    expect(screen.getByTestId('lodash-monthly').textContent).toBe('0')
  })
})
