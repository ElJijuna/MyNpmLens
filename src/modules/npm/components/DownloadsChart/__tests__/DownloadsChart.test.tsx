import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { DownloadsChart } from '../index'
import * as npmApiHooks from '@api-hooks/npm'

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

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

afterEach(() => jest.restoreAllMocks())

describe('DownloadsChart', () => {
  it('renders nothing when no package has data yet', () => {
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    const { container } = render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })
    expect(container.firstChild).toBeNull()
  })

  it('renders the chart as soon as at least one package has data', () => {
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads')
      .mockReturnValueOnce({
        data: {
          react: { downloads: 50_000_000, package: 'react', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)
      .mockReturnValueOnce({
        data: undefined,
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows the Downloads heading', () => {
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads')
      .mockReturnValueOnce({
        data: {
          react: { downloads: 1000, package: 'react', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)
      .mockReturnValueOnce({
        data: {
          react: { downloads: 4000, package: 'react', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    render(<DownloadsChart packageNames={['react']} />, { wrapper })
    expect(screen.getByText('Downloads')).toBeInTheDocument()
  })

  it('passes correct weekly and monthly values to the chart', () => {
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads')
      .mockReturnValueOnce({
        data: {
          react: { downloads: 5000, package: 'react', start: '', end: '' },
          lodash: { downloads: 3000, package: 'lodash', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)
      .mockReturnValueOnce({
        data: {
          react: { downloads: 20000, package: 'react', start: '', end: '' },
          lodash: { downloads: 12000, package: 'lodash', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })

    expect(screen.getByTestId('react-weekly').textContent).toBe('5000')
    expect(screen.getByTestId('react-monthly').textContent).toBe('20000')
    expect(screen.getByTestId('lodash-weekly').textContent).toBe('3000')
    expect(screen.getByTestId('lodash-monthly').textContent).toBe('12000')
  })

  it('defaults missing data to 0 instead of crashing', () => {
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads')
      .mockReturnValueOnce({
        data: {
          react: { downloads: 1000, package: 'react', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)
      .mockReturnValueOnce({
        data: {
          react: { downloads: 4000, package: 'react', start: '', end: '' },
        },
      } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })

    expect(screen.getByTestId('lodash-weekly').textContent).toBe('0')
    expect(screen.getByTestId('lodash-monthly').textContent).toBe('0')
  })

  it('requests weekly and monthly downloads in bulk', () => {
    const bulkSpy = jest.spyOn(npmApiHooks, 'useNpmBulkDownloads').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>)

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper })

    expect(bulkSpy).toHaveBeenNthCalledWith(1, ['react', 'lodash'], {
      period: 'last-week',
      enabled: true,
    })
    expect(bulkSpy).toHaveBeenNthCalledWith(2, ['react', 'lodash'], {
      period: 'last-month',
      enabled: true,
    })
  })
})
