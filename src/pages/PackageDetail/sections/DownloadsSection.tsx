import { Text, Badge, Box, WrapBox } from '@gnome-ui/react'
import { SectionCard } from '@/components/SectionCard'
import { useNpmPackageDownloads } from '@api-hooks/npm'

interface DownloadsSectionProps {
  name: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function DownloadsSection({ name }: DownloadsSectionProps) {
  const { data: weekly, isPending: weeklyPending, error: weeklyError } = useNpmPackageDownloads(name, { period: 'last-week' })
  const { data: monthly, isPending: monthlyPending, error: monthlyError } = useNpmPackageDownloads(name, { period: 'last-month' })

  const isPending = weeklyPending || monthlyPending
  const error = weeklyError ?? monthlyError

  return (
    <SectionCard title="Downloads" isLoading={isPending} error={error as Error | null}>
      {(weekly || monthly) && (
        <WrapBox childSpacing={24}>
          {weekly && (
            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">Last week</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatNumber(weekly.downloads)}
              </Text>
              <Badge variant="accent">{weekly.downloads.toLocaleString()} downloads</Badge>
            </Box>
          )}

          {monthly && (
            <Box orientation="vertical" spacing={3}>
              <Text variant="caption-heading" color="dim">Last month</Text>
              <Text variant="numeric" style={{ fontSize: '2rem' }}>
                {formatNumber(monthly.downloads)}
              </Text>
              <Badge variant="neutral">{monthly.downloads.toLocaleString()} downloads</Badge>
            </Box>
          )}
        </WrapBox>
      )}
    </SectionCard>
  )
}
