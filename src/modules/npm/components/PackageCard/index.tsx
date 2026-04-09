import { Card, Text, Badge, Spinner, Icon } from '@gnome-ui/react'
import { Star } from '@gnome-ui/icons'
import { useNavigate } from '@tanstack/react-router'
import { useNpmPackage, useNpmDownloads, useBundleSize } from '@/modules/npm/hooks'
import { useGitHubStats } from '@/modules/github/hooks'

interface PackageCardProps {
  name: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${bytes} B`
}

export function PackageCard({ name }: PackageCardProps) {
  const navigate = useNavigate()
  const { data: pkg, isLoading: pkgLoading } = useNpmPackage(name)
  const { data: downloads } = useNpmDownloads(name)
  const { data: bundle } = useBundleSize(name)
  const { data: github } = useGitHubStats(
    pkg?.repository?.github?.owner ?? null,
    pkg?.repository?.github?.repo ?? null,
  )

  return (
    <Card
      interactive
      padding="md"
      onClick={() => navigate({ to: '/package/$name', params: { name }, search: { version: undefined } })}
      aria-label={`View details for ${name}`}
    >
      {pkgLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
          <Spinner size="md" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="heading">{name}</Text>
            {pkg?.license && (
              <Badge variant="neutral">{pkg.license}</Badge>
            )}
          </div>

          {pkg?.version && (
            <Text variant="caption" color="dim">
              v{pkg.version}
              {pkg.versions.length > 0 && (
                <span style={{ marginLeft: '0.4rem', opacity: 0.6 }}>
                  · {pkg.versions.length} versions
                </span>
              )}
            </Text>
          )}

          {pkg?.description && (
            <Text
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {pkg.description}
            </Text>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {downloads && (
              <Text variant="caption" color="dim">
                ↓ {formatNumber(downloads.weekly)}/wk
              </Text>
            )}
            {bundle && (
              <Text variant="caption" color="dim">
                ⬡ {formatBytes(bundle.gzip)} gz
              </Text>
            )}
            {github && (
              <Text variant="caption" color="dim" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Icon icon={Star} size="sm" />
                {formatNumber(github.stars)}
              </Text>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
