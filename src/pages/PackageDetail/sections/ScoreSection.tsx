import { useNpmPackageScore } from '@api-hooks/npm';
import { RadialBarChart } from '@gnome-ui/charts';
import { ErrorState } from '@gnome-ui/layout/components/ErrorState';
import { Text } from '@gnome-ui/react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '@/components/SectionCard';
import { useFormatters } from '@/hooks/useFormatters';

interface ScoreSectionProps {
  name: string;
}

export const ScoreSection = ({ name }: ScoreSectionProps) => {
  const { t } = useTranslation();
  const { formatPercent } = useFormatters();
  const { data, isPending, error } = useNpmPackageScore(name);

  const chartData = data
    ? [
        {
          label: t('packageDetail.scoreQuality'),
          value: Math.round(data.score.detail.quality * 100),
        },
        {
          label: t('packageDetail.scorePopularity'),
          value: Math.round(data.score.detail.popularity * 100),
        },
        {
          label: t('packageDetail.scoreMaintenance'),
          value: Math.round(data.score.detail.maintenance * 100),
        },
      ]
    : [];

  return (
    <SectionCard title={t('packageDetail.score')} isLoading={isPending}>
      {error && (
        <ErrorState type="generic" title={t('sectionCard.error')} description={error.message} />
      )}
      {data && (
        <>
          <RadialBarChart
            data={chartData}
            height={220}
            showLabels
            showLegend
            aria-label={t('packageDetail.score')}
          />
          <Text variant="caption" color="dim">
            {t('packageDetail.scoreFinal')}: {formatPercent(data.score.final)}
          </Text>
        </>
      )}
    </SectionCard>
  );
};
