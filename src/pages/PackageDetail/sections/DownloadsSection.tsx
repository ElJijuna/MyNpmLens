import { useTranslation } from 'react-i18next'
import { Text, Badge, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageDownloads } from '@api-hooks/npm'

interface DownloadsSectionProps {
  name: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function DownloadsSection({ name }: DownloadsSectionProps) {
  const { t, i18n } = useTranslation()
  const { data: weekly, isPending: weeklyPending, error: weeklyError } = useNpmPackageDownloads(name, { period: 'last-week' })
  const { data: monthly, isPending: monthlyPending, error: monthlyError } = useNpmPackageDownloads(name, { period: 'last-month' })

  const isPending = weeklyPending || monthlyPending
  const error = weeklyError ?? monthlyError

  return (
    <SectionCard title={t('packageDetail.downloads')} isLoading={isPending} error={error as Error | null}>
      {(weekly || monthly) && (
        <WrapBox childSpacing={24}>
          {weekly && (
            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">{t('packageDetail.lastWeek')}</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatNumber(weekly.downloads)}
              </Text>
              <Badge variant="accent">{weekly.downloads.toLocaleString(i18n.language)} {t('packageDetail.downloadsLabel')}</Badge>
            </Box>
          )}

          {monthly && (
            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">{t('packageDetail.lastMonth')}</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatNumber(monthly.downloads)}
              </Text>
              <Badge variant="neutral">{monthly.downloads.toLocaleString(i18n.language)} {t('packageDetail.downloadsLabel')}</Badge>
            </Box>
          )}
        </WrapBox>
      )}
    </SectionCard>
  )
}
