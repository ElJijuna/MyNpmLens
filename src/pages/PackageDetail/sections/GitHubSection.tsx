import { Text, Badge, Link, Icon } from '@gnome-ui/react'
import { Star, Share } from '@gnome-ui/icons'
import { SectionCard } from '@/components/SectionCard'
import { useGitHubStats } from '@/modules/github/hooks'
import { parseGitHubSlug } from '@/modules/github/utils/parseGitHubSlug'
import { useNpmPackage } from '@api-hooks/npm'

interface GitHubSectionProps {
  packageName: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatNumber(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function GitHubSection({ packageName }: GitHubSectionProps) {
  const { data: pkg } = useNpmPackage(packageName)
  const slug = pkg?.repository?.url ? parseGitHubSlug(pkg.repository.url) : null
  const { data, isPending, error } = useGitHubStats(slug?.owner ?? null, slug?.repo ?? null)

  if (!isPending && !slug) return null

  return (
    <SectionCard title="GitHub" isLoading={isPending} error={error as Error | null}>
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">Stars</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icon icon={Star} />
                <Text variant="numeric">{formatNumber(data.stars)}</Text>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">Forks</Text>
              <Text variant="numeric">{formatNumber(data.forks)}</Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">Open issues</Text>
              <Badge variant={data.openIssues > 100 ? 'warning' : 'neutral'}>
                {data.openIssues}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text variant="caption-heading" color="dim">Last pushed</Text>
            <Text variant="caption">{formatDate(data.lastPushedAt)}</Text>
          </div>

          <Text variant="caption">
            <Link
              href={data.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Icon icon={Share} size="sm" />
              {data.htmlUrl}
            </Link>
          </Text>
        </div>
      )}
    </SectionCard>
  )
}
