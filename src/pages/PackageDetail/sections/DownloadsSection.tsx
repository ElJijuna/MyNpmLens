import { useNpmPackageDownloadRange, useNpmPackageVersionDownloads } from '@api-hooks/npm';
import { AreaChart } from '@gnome-ui/charts';
import { Badge, Box, Text, WrapBox } from '@gnome-ui/react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/SectionCard';
import { useFormatters } from '@/hooks/useFormatters';

interface DownloadsSectionProps {
  name: string;
  version: string;
}

export const DownloadsSection = ({ name, version }: DownloadsSectionProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatCompactNumber } = useFormatters();
  const { data, isPending, error } = useNpmPackageVersionDownloads(name, version, {
    period: 'last-week',
  });
  const { data: rangeData } = useNpmPackageDownloadRange(name, { period: 'last-month' });

  const chartData = rangeData?.downloads.map((d) => ({ day: d.day, downloads: d.downloads })) ?? [];

  return (
    <SectionCard
      title={t('packageDetail.downloads')}
      isLoading={isPending}
      error={error as Error | null}
    >
      {data && (
        <WrapBox childSpacing={24}>
          <Box orientation="vertical" spacing={3}>
            <Text variant="caption-heading" color="dim">
              {t('packageDetail.lastWeek')}
            </Text>
            <Text variant="numeric" style={{ fontSize: '2rem' }}>
              {formatCompactNumber(data.downloads)}
            </Text>
            <Badge variant="accent">
              {formatNumber(data.downloads)} {t('packageDetail.downloadsLabel')}
            </Badge>
          </Box>
        </WrapBox>
      )}
      {chartData.length > 0 && (
        <AreaChart
          data={chartData}
          xAxisKey="day"
          series={[{ dataKey: 'downloads', name: t('packageDetail.downloadsLabel') }]}
          height={200}
          showGrid
          gradient
        />
      )}
    </SectionCard>
  );
};
