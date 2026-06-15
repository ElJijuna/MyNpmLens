import * as npmApiHooks from '@api-hooks/npm';
import { GnomeProvider } from '@gnome-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DownloadsChart } from '../index';

jest.mock('@gnome-ui/charts', () => ({
  BarChart: ({
    data,
    xAxisKey,
    series,
    showLegend,
  }: {
    data: Record<string, unknown>[];
    xAxisKey: string;
    series: { dataKey: string; name: string; color?: string }[];
    showLegend?: boolean;
  }) => (
    <div data-testid="bar-chart" data-show-legend={String(showLegend)}>
      {series.map((s) => (
        <span
          key={s.dataKey}
          data-testid={`series-${s.dataKey}`}
          data-color={s.color}
          data-name={s.name}
        />
      ))}
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
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <GnomeProvider numberFormat={{ notation: 'compact', compactDisplay: 'short' }}>
        {children}
      </GnomeProvider>
    </QueryClientProvider>
  );
}

function mockPackageData({
  downloads,
  versions = {},
}: {
  downloads: Record<string, number | undefined>;
  versions?: Record<string, number | undefined>;
}) {
  jest.spyOn(npmApiHooks, 'useNpmClient').mockReturnValue({
    package: jest.fn((name: string) => ({
      get: jest.fn(async () => ({
        versions: Object.fromEntries(
          Array.from({ length: versions[name] ?? 0 }, (_, index) => [`${index}.0.0`, {}]),
        ),
      })),
      downloads: jest.fn(async () => {
        const value = downloads[name];
        return { downloads: value ?? 0, package: name, start: '', end: '' };
      }),
    })),
  } as unknown as ReturnType<typeof npmApiHooks.useNpmClient>);
}

afterEach(() => jest.restoreAllMocks());

describe('DownloadsChart', () => {
  it('keeps a stable card when download totals are unavailable', async () => {
    mockPackageData({ downloads: {} });

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });

    expect(await screen.findByText('Download totals unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('announces loading while download data is pending', () => {
    jest.spyOn(npmApiHooks, 'useNpmClient').mockReturnValue({
      package: jest.fn(() => ({
        get: jest.fn(() => new Promise(() => {})),
        downloads: jest.fn(() => new Promise(() => {})),
      })),
    } as unknown as ReturnType<typeof npmApiHooks.useNpmClient>);

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('renders the bar chart as soon as at least one package has data', async () => {
    mockPackageData({ downloads: { react: 50_000_000 } });

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });
    expect(await screen.findByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows the Downloads heading', async () => {
    mockPackageData({ downloads: { react: 1000 } });

    render(<DownloadsChart packageNames={['react']} />, { wrapper });
    expect(await screen.findByText('Downloads')).toBeInTheDocument();
  });

  it('passes per-package weekly download and version values to the bar chart', async () => {
    mockPackageData({
      downloads: { react: 5000, lodash: 3000 },
      versions: { react: 19, lodash: 4 },
    });

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });

    expect(await screen.findByTestId('react-downloads')).toHaveTextContent('5000');
    expect(screen.getByTestId('react-versions')).toHaveTextContent('19');
    expect(screen.getByTestId('lodash-downloads')).toHaveTextContent('3000');
    expect(screen.getByTestId('lodash-versions')).toHaveTextContent('4');
  });

  it('uses separate colors and shows the legend for downloads and versions', async () => {
    mockPackageData({
      downloads: { react: 5000 },
      versions: { react: 19 },
    });

    render(<DownloadsChart packageNames={['react']} />, { wrapper });

    expect(await screen.findByTestId('bar-chart')).toHaveAttribute('data-show-legend', 'true');
    expect(screen.getByTestId('series-downloads')).toHaveAttribute('data-color', '#3584e4');
    expect(screen.getByTestId('series-versions')).toHaveAttribute('data-color', '#33d17a');
    expect(screen.getByTestId('series-downloads')).toHaveAttribute('data-name', 'Weekly downloads');
    expect(screen.getByTestId('series-versions')).toHaveAttribute('data-name', 'Versions');
  });

  it('formats visible totals with compact notation', async () => {
    mockPackageData({
      downloads: { react: 1_500_000 },
      versions: { react: 1_200 },
    });

    render(<DownloadsChart packageNames={['react']} />, { wrapper });

    expect(await screen.findByText('1.5M')).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument();
  });

  it('ignores missing data instead of crashing', async () => {
    mockPackageData({ downloads: { react: 1000 } });

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });

    expect(await screen.findByTestId('react-downloads')).toHaveTextContent('1000');
    expect(screen.queryByTestId('lodash-downloads')).not.toBeInTheDocument();
  });

  it('requests weekly downloads per package so the chart shares package-card cache keys', async () => {
    const packageSpy = jest.fn((name: string) => ({
      get: jest.fn(async () => ({ versions: { '1.0.0': {} } })),
      downloads: jest.fn(async () => ({ downloads: 100, package: name, start: '', end: '' })),
    }));
    jest.spyOn(npmApiHooks, 'useNpmClient').mockReturnValue({
      package: packageSpy,
    } as unknown as ReturnType<typeof npmApiHooks.useNpmClient>);

    render(<DownloadsChart packageNames={['react', 'lodash']} />, { wrapper });

    expect(await screen.findByTestId('react-downloads')).toBeInTheDocument();
    expect(packageSpy).toHaveBeenCalledWith('react');
    expect(packageSpy).toHaveBeenCalledWith('lodash');
  });
});
