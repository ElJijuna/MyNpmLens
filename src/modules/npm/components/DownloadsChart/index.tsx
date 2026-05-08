import { useQueries } from '@tanstack/react-query'
import { npmQueryKeys, useNpmClient } from '@api-hooks/npm'
import { BarChart } from '@gnome-ui/charts'
import { Card, Text } from '@gnome-ui/react'

interface DownloadsChartProps {
  packageNames: string[]
}

export function DownloadsChart({ packageNames }: DownloadsChartProps) {
  const client = useNpmClient()
  const results = useQueries({
    queries: packageNames.flatMap((name) => [
      {
        queryKey: npmQueryKeys.packageDownloads(name, 'last-week'),
        queryFn: ({ signal }: { signal: AbortSignal }) => client.package(name).downloads('last-week', signal),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: npmQueryKeys.packageDownloads(name, 'last-month'),
        queryFn: ({ signal }: { signal: AbortSignal }) => client.package(name).downloads('last-month', signal),
        staleTime: 1000 * 60 * 60,
      },
    ]),
  })

  const hasData = results.some((r) => r.data != null)

  if (!hasData) return null

  const data = packageNames.map((name, i) => ({
    name,
    weekly: results[i * 2].data?.downloads ?? 0,
    monthly: results[i * 2 + 1].data?.downloads ?? 0,
  }))

  return (
    <Card padding="md">
      <Text variant="heading" style={{ marginBottom: '1rem' }}>
        Downloads
      </Text>
      <BarChart
        data={data}
        xAxisKey="name"
        series={[
          { dataKey: 'weekly', name: 'Weekly' },
          { dataKey: 'monthly', name: 'Monthly' },
        ]}
        showGrid
        showLegend
        height={260}
      />
    </Card>
  )
}
