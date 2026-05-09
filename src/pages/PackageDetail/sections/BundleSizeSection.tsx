import { useTranslation } from 'react-i18next'
import { Text, Badge, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useBpPackageVersionSize } from '@api-hooks/bp'
import { useNpmPackageVersionSize } from '@api-hooks/npm'
import { useFormatters } from '@/hooks/useFormatters'

interface BundleSizeSectionProps {
  name: string
  version?: string
}

export function BundleSizeSection({ name, version = '' }: BundleSizeSectionProps) {
  const { t } = useTranslation()
  const { formatBytes, formatNumber } = useFormatters()
  const enabled = name.length > 0 && version.length > 0
  const { data, isPending, error } = useBpPackageVersionSize(name, version, { enabled })
  const { data: sizeData } = useNpmPackageVersionSize(name, version, { enabled })

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

          {sizeData && (
            <WrapBox childSpacing={24}>
              <Box orientation="vertical" spacing={3}>
                <Text variant="caption-heading" color="dim">{t('packageDetail.publishSize')}</Text>
                <Text variant="numeric" style={{ fontSize: '1.5rem' }}>{sizeData.publish.pretty}</Text>
                <Text variant="caption" color="dim">{formatNumber(sizeData.publish.files)} files</Text>
              </Box>
              <Box orientation="vertical" spacing={3}>
                <Text variant="caption-heading" color="dim">{t('packageDetail.installSize')}</Text>
                <Text variant="numeric" style={{ fontSize: '1.5rem' }}>{sizeData.install.pretty}</Text>
                <Text variant="caption" color="dim">{formatNumber(sizeData.install.files)} files</Text>
              </Box>
            </WrapBox>
          )}
        </Box>
      )}
    </SectionCard>
  )
}
