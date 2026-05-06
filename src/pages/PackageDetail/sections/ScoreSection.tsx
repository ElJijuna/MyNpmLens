import { useTranslation } from 'react-i18next'
import { Text } from '@gnome-ui/react'
import { RadialBarChart } from '@gnome-ui/charts'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageScore } from '@api-hooks/npm'

interface ScoreSectionProps {
  name: string
}

export function ScoreSection({ name }: ScoreSectionProps) {
  const { t } = useTranslation()
  const { data, isPending, error } = useNpmPackageScore(name)

  const chartData = data ? [
    { label: t('packageDetail.scoreQuality'),     value: Math.round(data.score.detail.quality     * 100) },
    { label: t('packageDetail.scorePopularity'),  value: Math.round(data.score.detail.popularity  * 100) },
    { label: t('packageDetail.scoreMaintenance'), value: Math.round(data.score.detail.maintenance * 100) },
  ] : []

  return (
    <SectionCard title={t('packageDetail.score')} isLoading={isPending} error={error as Error | null}>
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
            {t('packageDetail.scoreFinal')}: {(data.score.final * 100).toFixed(0)}%
          </Text>
        </>
      )}
    </SectionCard>
  )
}
