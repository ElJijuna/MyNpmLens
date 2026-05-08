import { useNpmBulkDownloads } from '@api-hooks/npm'
import { BarChart } from '@gnome-ui/charts'
import { Card, Text } from '@gnome-ui/react'

interface DownloadsChartProps {
  packageNames: string[]
}

export function DownloadsChart({ packageNames }: DownloadsChartProps) {
  const weekly = useNpmBulkDownloads(packageNames, {
    period: 'last-week',
    enabled: packageNames.length > 0,
  })
  const monthly = useNpmBulkDownloads(packageNames, {
    period: 'last-month',
    enabled: packageNames.length > 0,
  })

  const hasData = weekly.data != null || monthly.data != null

  if (!hasData) return null

  const data = packageNames.map((name) => ({
    name,
    weekly: weekly.data?.[name]?.downloads ?? 0,
    monthly: monthly.data?.[name]?.downloads ?? 0,
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
