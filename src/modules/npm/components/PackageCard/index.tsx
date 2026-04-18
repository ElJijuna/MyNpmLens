import { Card, Text, Badge, Spinner, Icon } from '@gnome-ui/react'
import { Star } from '@gnome-ui/icons'
import { useNavigate } from '@tanstack/react-router'
import { useNpmPackage, useNpmPackageDownloads } from '@api-hooks/npm'
import { useBpPackageSize } from '@api-hooks/bp'
import { useGitHubStats } from '@/modules/github/hooks'
import { parseGitHubSlug } from '@/modules/github/utils/parseGitHubSlug'

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
  const { data: pkg, isPending: pkgLoading } = useNpmPackage(name)
  const { data: weekly } = useNpmPackageDownloads(name, { period: 'last-week' })
  const { data: bundle } = useBpPackageSize(name)
  const slug = pkg?.repository?.url ? parseGitHubSlug(pkg.repository.url) : null
  const { data: github } = useGitHubStats(slug?.owner ?? null, slug?.repo ?? null)

  const version = pkg?.['dist-tags']?.latest
  const versionCount = pkg ? Object.keys(pkg.versions).length : 0

  return (
    <Card
      interactive
      padding="md"
      onClick={() => navigate({ to: '/packages/$name', params: { name }, search: { version: undefined } })}
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

          {version && (
            <Text variant="caption" color="dim">
              v{version}
              {versionCount > 0 && (
                <span style={{ marginLeft: '0.4rem', opacity: 0.6 }}>
                  · {versionCount} versions
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
            {weekly && (
              <Text variant="caption" color="dim">
                ↓ {formatNumber(weekly.downloads)}/wk
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
