import { npmQueryKeys, useNpmClient } from '@api-hooks/npm';
import { BarChart } from '@gnome-ui/charts';
import { PanelCard } from '@gnome-ui/layout/components/PanelCard';
import { LoadingStatus } from '@gnome-ui/layout';
import { Box, Spinner, Text, WrapBox, useNumberFormatter } from '@gnome-ui/react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface DownloadsChartProps {
  packageNames: string[];
}

const DOWNLOADS_CHART_LIMIT = 12;
export const DownloadsChart = ({ packageNames }: DownloadsChartProps) => {
  const { t } = useTranslation();
  const numberFormatter = useNumberFormatter();
  const chartPackageNames = packageNames.slice(0, DOWNLOADS_CHART_LIMIT);
  const client = useNpmClient();

  const downloadsQueries = useQueries({
    queries: chartPackageNames.map((name) => ({
      queryKey: npmQueryKeys.packageDownloads(name, 'last-week'),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        client.package(name).downloads('last-week', signal),
      enabled: chartPackageNames.length > 0,
    })),
  });
  const packageQueries = useQueries({
    queries: chartPackageNames.map((name) => ({
      queryKey: npmQueryKeys.package(name),
      queryFn: ({ signal }: { signal: AbortSignal }) => client.package(name).get(signal),
      enabled: chartPackageNames.length > 0,
    })),
  });

  const isLoading =
    downloadsQueries.some((query) => query.isPending) ||
    packageQueries.some((query) => query.isPending);
  const chartData = chartPackageNames
    .map((name, index) => ({
      name,
      downloads: downloadsQueries[index]?.data?.downloads ?? 0,
      versions: Object.keys(packageQueries[index]?.data?.versions ?? {}).length,
    }))
    .filter((row) => row.downloads > 0 || row.versions > 0);
  const hasData = chartData.length > 0;
  const weeklyDownloads = chartData.reduce((total, row) => total + row.downloads, 0);
  const versionsTotal = chartData.reduce((total, row) => total + row.versions, 0);

  if (!hasData) {
    if (isLoading) {
      return (
        <PanelCard title={<Text variant="caption-heading">{t('downloadsChart.title')}</Text>}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
            <LoadingStatus />
            <Spinner size="md" label="" />
          </div>
        </PanelCard>
      );
    }

    return (
      <PanelCard title={<Text variant="caption-heading">{t('downloadsChart.title')}</Text>}>
        <Text color="dim">{t('downloadsChart.unavailable')}</Text>
      </PanelCard>
    );
  }

  return (
    <PanelCard title={<Text variant="caption-heading">{t('downloadsChart.title')}</Text>}>
      <BarChart
        data={chartData}
        xAxisKey="name"
        series={[
          {
            dataKey: 'downloads',
            name: t('downloadsChart.weeklySeries'),
            color: '#3584e4',
          },
          {
            dataKey: 'versions',
            name: t('downloadsChart.versionsSeries'),
            color: '#33d17a',
          },
        ]}
        height={260}
        showGrid
        showLegend
      />
      <WrapBox justify="space-between" align="center" style={{ marginTop: '1rem' }}>
        <Box spacing={2}>
          <Text variant="caption" color="dim">
            {t('downloadsChart.weeklyTotal')}
          </Text>
          <Text variant="numeric">{numberFormatter.format(weeklyDownloads)}</Text>
        </Box>
        <Box spacing={2}>
          <Text variant="caption" color="dim">
            {t('downloadsChart.versionsTotal')}
          </Text>
          <Text variant="numeric">{numberFormatter.format(versionsTotal)}</Text>
        </Box>
      </WrapBox>
    </PanelCard>
  );
};
