import { useTranslation } from 'react-i18next'
import { Text, Badge, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useBpPackageVersionSize } from '@api-hooks/bp'

interface BundleSizeSectionProps {
  name: string
  version?: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} kB`
  return `${bytes} B`
}

export function BundleSizeSection({ name, version = '' }: BundleSizeSectionProps) {
  const { t } = useTranslation()
  const { data, isPending, error } = useBpPackageVersionSize(name, version, {
    enabled: name.length > 0 && version.length > 0,
  })

  return (
    <SectionCard title={t('packageDetail.bundleSize')} isLoading={isPending} error={error as Error | null}>
      {data && (
        <Box orientation="vertical" spacing={12}>
          <WrapBox childSpacing={24}>
            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">{t('packageDetail.minified')}</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatBytes(data.size)}
              </Text>
            </Box>

            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">{t('packageDetail.minifiedGzipped')}</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatBytes(data.gzip)}
              </Text>
            </Box>
          </WrapBox>

          <WrapBox childSpacing={6} align="center">
            <Text variant="caption" color="dim">v{data.version}</Text>
            <Badge variant={data.hasSideEffects ? 'warning' : 'success'}>
              {data.hasSideEffects ? t('packageDetail.hasSideEffects') : t('packageDetail.sideEffectFree')}
            </Badge>
          </WrapBox>
        </Box>
      )}
    </SectionCard>
  )
}
