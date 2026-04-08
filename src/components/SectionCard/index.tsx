import { type ReactNode } from 'react'
import { Card, Spinner, Banner, Text } from '@gnome-ui/react'

interface SectionCardProps {
  title: string
  isLoading: boolean
  error?: Error | null
  children: ReactNode
}

export function SectionCard({ title, isLoading, error, children }: SectionCardProps) {
  return (
    <Card padding="lg">
      <Text variant="title-4" as="h2" style={{ marginBottom: '1rem' }}>
        {title}
      </Text>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
          <Spinner size="md" />
        </div>
      )}

      {!isLoading && error && (
        <Banner variant="error">
          {error.message ?? 'Something went wrong loading this section.'}
        </Banner>
      )}

      {!isLoading && !error && children}
    </Card>
  )
}
