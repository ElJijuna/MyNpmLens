import { Text, Badge, Link } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackage } from '@/modules/npm/hooks'

interface PackageInfoSectionProps {
  name: string
}

export function PackageInfoSection({ name }: PackageInfoSectionProps) {
  const { data, isLoading, error } = useNpmPackage(name)

  return (
    <SectionCard title="Package info" isLoading={isLoading} error={error as Error | null}>
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Text variant="title-2" as="h1">{data.name}</Text>
            <Text variant="caption" color="dim">v{data.version}</Text>
            {data.license && <Badge variant="neutral">{data.license}</Badge>}
          </div>

          {data.description && (
            <Text color="dim">{data.description}</Text>
          )}

          {data.author?.name && (
            <Text variant="caption" color="dim">
              Author: {data.author.name}
              {data.author.email && ` <${data.author.email}>`}
            </Text>
          )}

          {data.homepage && (
            <Text variant="caption">
              <Link href={data.homepage} target="_blank" rel="noopener noreferrer">
                {data.homepage}
              </Link>
            </Text>
          )}
        </div>
      )}
    </SectionCard>
  )
}
