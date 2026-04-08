import { Text, Badge } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmDownloads } from '@/modules/npm/hooks'

interface DownloadsSectionProps {
  name: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function DownloadsSection({ name }: DownloadsSectionProps) {
  const { data, isLoading, error } = useNpmDownloads(name)

  return (
    <SectionCard title="Downloads" isLoading={isLoading} error={error as Error | null}>
      {data && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text variant="caption-heading" color="dim">Last week</Text>
            <Text variant="numeric" style={{ fontSize: '2rem' }}>
              {formatNumber(data.weekly)}
            </Text>
            <Badge variant="accent">{data.weekly.toLocaleString()} downloads</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text variant="caption-heading" color="dim">Last month</Text>
            <Text variant="numeric" style={{ fontSize: '2rem' }}>
              {formatNumber(data.monthly)}
            </Text>
            <Badge variant="neutral">{data.monthly.toLocaleString()} downloads</Badge>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
