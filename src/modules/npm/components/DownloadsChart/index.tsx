import { useNpmBulkDownloads } from '@api-hooks/npm';
import { BarChart } from '@gnome-ui/charts';
import { Card, Text } from '@gnome-ui/react';

interface DownloadsChartProps {
  packageNames: string[];
}

const BULK_DOWNLOADS_LIMIT = 128;

export const DownloadsChart = ({ packageNames }: DownloadsChartProps) => {
  const chartPackageNames = packageNames.slice(0, BULK_DOWNLOADS_LIMIT);

  const weekly = useNpmBulkDownloads(chartPackageNames, {
    period: 'last-week',
    enabled: chartPackageNames.length > 0,
  });
  const monthly = useNpmBulkDownloads(chartPackageNames, {
    period: 'last-month',
    enabled: chartPackageNames.length > 0,
  });

  const hasData =
    (weekly.data !== null && weekly.data !== undefined) ||
    (monthly.data !== null && monthly.data !== undefined);

  if (!hasData) {
    return null;
  }

  const data = chartPackageNames.map((name) => ({
    name,
    weekly: weekly.data?.[name]?.downloads ?? 0,
    monthly: monthly.data?.[name]?.downloads ?? 0,
  }));

  return (
    <Card padding="md">
      <Text variant="heading" style={{ marginBottom: '1rem' }}>
        Downloads
      </Text>
      <BarChart
        data={data}
        xAxisKey="name"
        series={[
          { dataKey: 'weekly', name: 'Weekly' },
          { dataKey: 'monthly', name: 'Monthly' },
        ]}
        showGrid
        showLegend
        height={260}
      />
    </Card>
  );
};
