import { useTranslation } from 'react-i18next'
import { Text, Badge, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageVersionDownloads } from '@api-hooks/npm'

interface DownloadsSectionProps {
  name: string
  version: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function DownloadsSection({ name, version }: DownloadsSectionProps) {
  const { t, i18n } = useTranslation()
  const { data, isPending, error } = useNpmPackageVersionDownloads(name, version, { period: 'last-week' })

  return (
    <SectionCard title={t('packageDetail.downloads')} isLoading={isPending} error={error as Error | null}>
      {data && (
        <WrapBox childSpacing={24}>
          <Box orientation="vertical" spacing={3}>
            <Text variant="caption-heading" color="dim">{t('packageDetail.lastWeek')}</Text>
            <Text variant="numeric" style={{ fontSize: '2rem' }}>
              {formatNumber(data.downloads)}
            </Text>
            <Badge variant="accent">{data.downloads.toLocaleString(i18n.language)} {t('packageDetail.downloadsLabel')}</Badge>
          </Box>
        </WrapBox>
      )}
    </SectionCard>
  )
}
