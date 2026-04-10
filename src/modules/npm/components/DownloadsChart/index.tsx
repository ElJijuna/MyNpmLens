import { useQueries } from '@tanstack/react-query'
import { BarChart } from '@gnome-ui/charts'
import { Card, Text } from '@gnome-ui/react'
import { fetchNpmDownloads } from '@/modules/npm/proxy'
import { npmQueryKeys } from '@/modules/npm/hooks/queryKeys'

interface DownloadsChartProps {
  packageNames: string[]
}

export function DownloadsChart({ packageNames }: DownloadsChartProps) {
  const results = useQueries({
    queries: packageNames.map((name) => ({
      queryKey: npmQueryKeys.downloads(name),
      queryFn: () => fetchNpmDownloads(name),
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 2,
    })),
  })

  const hasData = results.some((r) => r.data != null)

  if (!hasData) return null

  const data = packageNames.map((name, i) => ({
    name,
    Semanal: results[i].data?.weekly ?? 0,
    Mensual: results[i].data?.monthly ?? 0,
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
          { dataKey: 'Semanal', name: 'Semanal' },
          { dataKey: 'Mensual', name: 'Mensual' },
        ]}
        showGrid
        showLegend
        height={260}
      />
    </Card>
  )
}
