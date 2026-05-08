import { useQueries } from '@tanstack/react-query'
import { npmQueryKeys } from '@api-hooks/npm'
import { NpmClient } from 'npmjs-api-client'
import { BarChart } from '@gnome-ui/charts'
import { Card, Text } from '@gnome-ui/react'
import { useTranslation } from 'react-i18next'

const client = new NpmClient()
const MAX_VISIBLE_MAINTAINERS = 12

interface MaintainersPackagesChartProps {
  usernames: string[]
}

export function MaintainersPackagesChart({ usernames }: MaintainersPackagesChartProps) {
  const { t } = useTranslation()
  const results = useQueries({
    queries: usernames.map((username) => ({
      queryKey: npmQueryKeys.maintainerPackages(username, { size: 1, from: 0 }),
      queryFn: ({ signal }: { signal: AbortSignal }) => client.maintainer(username).packages({ size: 1, from: 0 }, signal),
      staleTime: 1000 * 60 * 60,
    })),
  })

  const data = usernames
    .map((username, index) => ({
      name: username,
      packages: results[index].data?.total ?? 0,
      hasData: results[index].data != null,
    }))
    .filter((item) => item.hasData)
    .sort((a, b) => b.packages - a.packages)
    .slice(0, MAX_VISIBLE_MAINTAINERS)

  if (data.length === 0) return null

  return (
    <Card padding="md">
      <Text variant="heading" style={{ marginBottom: '1rem' }}>
        {t('maintainer.packages')}
      </Text>
      <BarChart
        data={data}
        xAxisKey="name"
        series={[{ dataKey: 'packages', name: t('maintainer.packages') }]}
        showGrid
        height={260}
      />
    </Card>
  )
}
