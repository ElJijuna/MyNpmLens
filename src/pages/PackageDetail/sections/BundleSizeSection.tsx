import { Text, Badge } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useBundleSize } from '@/modules/npm/hooks'

interface BundleSizeSectionProps {
  name: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} kB`
  return `${bytes} B`
}

export function BundleSizeSection({ name }: BundleSizeSectionProps) {
  const { data, isLoading, error } = useBundleSize(name)

  return (
    <SectionCard title="Bundle size" isLoading={isLoading} error={error as Error | null}>
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">Minified</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatBytes(data.size)}
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text variant="caption-heading" color="dim">Minified + gzipped</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatBytes(data.gzip)}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Text variant="caption" color="dim">v{data.version}</Text>
            <Badge variant={data.hasSideEffects ? 'warning' : 'success'}>
              {data.hasSideEffects ? 'Has side effects' : 'Side-effect free'}
            </Badge>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
