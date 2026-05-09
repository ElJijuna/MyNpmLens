import { useTranslation } from 'react-i18next'
import { Text, Badge, Link, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageVersion, useNpmPackageMaintainers } from '@api-hooks/npm'
import { MaintainerAvatar } from '@/modules/npm/components/MaintainerAvatar'

interface PackageInfoSectionProps {
  name: string
  version: string
}

export function PackageInfoSection({ name, version }: PackageInfoSectionProps) {
  const { t } = useTranslation()
  const { data, isPending, error } = useNpmPackageVersion(name, version)
  const { data: maintainers } = useNpmPackageMaintainers(name)

  return (
    <SectionCard title={t('packageDetail.packageInfo')} isLoading={isPending} error={error as Error | null}>
      {data && (
        <Box orientation="vertical" spacing={6}>
          <WrapBox childSpacing={6} align="center">
            <Text variant="title-2" as="h1">{data.name}</Text>
            <Text variant="caption" color="dim">v{data.version}</Text>
            {data.license && <Badge variant="neutral">{data.license}</Badge>}
          </WrapBox>

          {data.description && (
            <Text color="dim">{data.description}</Text>
          )}

          {data.homepage && (
            <Text variant="caption">
              <Link href={data.homepage} target="_blank" rel="noopener noreferrer">
                {data.homepage}
              </Link>
            </Text>
          )}

          {maintainers && maintainers.length > 0 && (
            <Box orientation="vertical" spacing={4}>
              <Text variant="caption-heading" color="dim">{t('packageDetail.maintainers')}</Text>
              <WrapBox childSpacing={8} align="center">
                {maintainers.map((m) => {
                  const label = m.name ?? m.username ?? m.email ?? '?'
                  const username = m.username ?? m.name ?? label
                  return (
                    <WrapBox key={label} align="center" childSpacing={4}>
                      <MaintainerAvatar username={username} name={label} size="sm" />
                      <Text variant="caption">{label}</Text>
                    </WrapBox>
                  )
                })}
              </WrapBox>
            </Box>
          )}
        </Box>
      )}
    </SectionCard>
  )
}
