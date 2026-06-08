import { useTranslation } from 'react-i18next'
import { Text, Badge, Link, Icon } from '@gnome-ui/react'
import { Star, Share } from '@gnome-ui/icons'
import { SectionCard } from '@/components/SectionCard'
import { useGitHubStats } from '@/modules/github/hooks'
import { parseGitHubSlug } from '@/modules/github/utils/parseGitHubSlug'
import { useNpmPackage } from '@api-hooks/npm'
import { useFormatters } from '@/hooks/useFormatters'
import { useGhRepoLatestRelease } from '@api-hooks/gh'

interface GitHubSectionProps {
  packageName: string
}

export function GitHubSection({ packageName }: GitHubSectionProps) {
  const { t } = useTranslation()
  const { formatCompactNumber, formatDate, formatNumber } = useFormatters()
  const { data: pkg } = useNpmPackage(packageName)
  const slug = pkg?.repository?.url ? parseGitHubSlug(pkg.repository.url) : null
  const { data, isPending, error } = useGitHubStats(slug?.owner ?? null, slug?.repo ?? null)

  const { data: release } = useGhRepoLatestRelease(slug?.owner ?? '', slug?.repo ?? '', {
    enabled: slug !== null,
  })

  if (!isPending && !slug) return null

  return (
    <SectionCard title={t('packageDetail.github')} isLoading={isPending} error={error as Error | null}>
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">
                {t('packageDetail.stars')}
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icon icon={Star} />
                <Text variant="numeric">{formatCompactNumber(data.stars)}</Text>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">
                {t('packageDetail.forks')}
              </Text>
              <Text variant="numeric">{formatCompactNumber(data.forks)}</Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">
                {t('packageDetail.openIssues')}
              </Text>
              <Badge variant={data.openIssues > 100 ? 'warning' : 'neutral'}>{formatNumber(data.openIssues)}</Badge>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text variant="caption-heading" color="dim">
              {t('packageDetail.lastPushed')}
            </Text>
            <Text variant="caption">{formatDate(data.lastPushedAt)}</Text>
          </div>

          {release && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">
                {t('packageDetail.latestRelease')}
              </Text>
              <Text variant="caption">
                {release.tag_name}
                {release.published_at && ` · ${formatDate(release.published_at)}`}
              </Text>
            </div>
          )}

          {data.topics && data.topics.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">
                {t('packageDetail.topics')}
              </Text>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {data.topics.map((topic) => (
                  <Badge key={topic} variant="neutral">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Text variant="caption">
            <Link href={data.htmlUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Icon icon={Share} size="sm" />
              {data.htmlUrl}
            </Link>
          </Text>
        </div>
      )}
    </SectionCard>
  )
}
