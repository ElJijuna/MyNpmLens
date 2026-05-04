import { useTranslation } from 'react-i18next'
import { Text, Badge, Link, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageVersion } from '@api-hooks/npm'

interface PackageInfoSectionProps {
  name: string
  version: string
}

export function PackageInfoSection({ name, version }: PackageInfoSectionProps) {
  const { t } = useTranslation()
  const { data, isPending, error } = useNpmPackageVersion(name, version)

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
        </Box>
      )}
    </SectionCard>
  )
}
