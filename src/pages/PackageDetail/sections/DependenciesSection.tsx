import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Badge, Box, Icon, Text, WrapBox } from '@gnome-ui/react'
import { Npm } from '@gnome-ui/icons/third-party'
import { useNpmPackageVersion } from '@api-hooks/npm'
import { getIcon } from 'very-simple-icons'
import { SectionCard } from '@/components/SectionCard'
import type { BadgeVariant } from '@gnome-ui/react'

interface DepGroupProps {
  label: string
  variant: BadgeVariant
  deps: Record<string, string>
  onNavigate: (name: string) => void
}

function DepGroup({ label, variant, deps, onNavigate }: DepGroupProps) {
  const entries = Object.entries(deps)
  if (entries.length === 0) return null

  return (
    <Box orientation="vertical" spacing={8}>
      <WrapBox align="center" childSpacing={6}>
        <Text variant="caption-heading">{label}</Text>
        <Badge variant={variant}>{entries.length}</Badge>
      </WrapBox>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.4rem' }}>
        {entries.map(([name, range]) => {
          const iconData = getIcon(name)
          return (
            <WrapBox
              key={name}
              align="center"
              childSpacing={6}
              style={{ cursor: 'pointer', minWidth: 0, padding: '0.25rem 0.5rem', borderRadius: '6px' }}
              onClick={() => onNavigate(name)}
            >
              <Icon icon={iconData ? { path: iconData.path } : Npm} size="sm" />
              <Text
                variant="caption"
                style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
              >
                {name}
              </Text>
              <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                {range}
              </Text>
            </WrapBox>
          )
        })}
      </div>
    </Box>
  )
}

interface DependenciesSectionProps {
  name: string
  version: string
}

export function DependenciesSection({ name, version }: DependenciesSectionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isPending, error } = useNpmPackageVersion(name, version)

  function goToPackage(pkgName: string) {
    void navigate({ to: '/packages/$name', params: { name: pkgName }, search: {} })
  }

  const hasDeps = data && (
    Object.keys(data.dependencies ?? {}).length > 0 ||
    Object.keys(data.devDependencies ?? {}).length > 0 ||
    Object.keys(data.peerDependencies ?? {}).length > 0 ||
    Object.keys(data.optionalDependencies ?? {}).length > 0
  )

  return (
    <SectionCard title={t('packageDetail.dependencies')} isLoading={isPending} error={error as Error | null}>
      {data && !hasDeps && (
        <Text color="dim">{t('packageDetail.noDependencies')}</Text>
      )}
      {data && hasDeps && (
        <Box orientation="vertical" spacing={20}>
          <DepGroup
            label={t('packageDetail.depsRuntime')}
            variant="accent"
            deps={data.dependencies ?? {}}
            onNavigate={goToPackage}
          />
          <DepGroup
            label={t('packageDetail.depsPeer')}
            variant="warning"
            deps={data.peerDependencies ?? {}}
            onNavigate={goToPackage}
          />
          <DepGroup
            label={t('packageDetail.depsDev')}
            variant="neutral"
            deps={data.devDependencies ?? {}}
            onNavigate={goToPackage}
          />
          <DepGroup
            label={t('packageDetail.depsOptional')}
            variant="neutral"
            deps={data.optionalDependencies ?? {}}
            onNavigate={goToPackage}
          />
        </Box>
      )}
    </SectionCard>
  )
}
