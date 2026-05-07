import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Box, Button, Icon, InlineViewSwitcher, InlineViewSwitcherItem, Text, WrapBox } from '@gnome-ui/react'
import { Applications, Delete, ViewSidebar } from '@gnome-ui/icons'
import { CounterCard } from '@gnome-ui/layout/components/CounterCard'
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid'
import { useNpmMaintainer, useNpmMaintainerPackages } from '@api-hooks/npm'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { DownloadsChart } from '@/modules/npm/components/DownloadsChart'
import { MaintainerAvatar } from '@/modules/npm/components/MaintainerAvatar'
import { useRemoveMaintainer } from '@/modules/npm/hooks'

export function MaintainerPage() {
  const { t } = useTranslation()
  const { username } = useParams({ from: '/maintainers_/$username' })
  const navigate = useNavigate()
  const [packagesLayout, setPackagesLayout] = useState<DashboardGridLayout>('grid')
  const { data: user } = useNpmMaintainer(username)
  const { data: result } = useNpmMaintainerPackages(username)
  const removeMaintainer = useRemoveMaintainer()

  const packageNames = result?.objects.map((o) => o.package.name) ?? []
  const total = result?.total ?? 0

  function handleUnfollow() {
    removeMaintainer.mutate(username, {
      onSuccess: () => navigate({ to: '/maintainers' }),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={16}>
          <WrapBox justify="space-between" align="center">
            <Box orientation="horizontal" spacing={12} style={{ alignItems: 'center' }}>
              <MaintainerAvatar username={username} name={user?.name} size="lg" />
              <Box orientation="vertical" spacing={2}>
                <Text variant="heading">{user?.name ?? username}</Text>
                {user?.email && <Text variant="caption" color="dim">{user.email}</Text>}
              </Box>
            </Box>
            <WrapBox childSpacing={8} align="center">
              <InlineViewSwitcher
                value={packagesLayout}
                onValueChange={(value) => setPackagesLayout(value as DashboardGridLayout)}
                variant="pill"
                aria-label={t('dashboard.packageLayout')}
              >
                <InlineViewSwitcherItem name="grid" label={t('dashboard.gridView')} icon={Applications} />
                <InlineViewSwitcherItem name="column" label={t('dashboard.columnView')} icon={ViewSidebar} />
              </InlineViewSwitcher>
              <Button
                variant="destructive"
                size="sm"
                leadingIcon={<Icon icon={Delete} />}
                onClick={handleUnfollow}
                disabled={removeMaintainer.isPending}
              >
                {t('maintainer.unfollow')}
              </Button>
            </WrapBox>
          </WrapBox>

          <DashboardGrid columns={{ sm: 1, md: 2 }} gap="sm" style={{ maxWidth: '400px' }}>
            <DashboardGrid.Item span={1}>
              <CounterCard label="" value={total} accent animated suffix={` ${t('maintainer.packages').toLowerCase()}`} duration={5000} />
            </DashboardGrid.Item>
          </DashboardGrid>

          {packageNames.length > 0 && (
            <DownloadsChart packageNames={packageNames} />
          )}

          <Text variant="heading">{t('maintainer.packages')}</Text>

          <DashboardGrid layout={packagesLayout} columns={{ sm: 1, md: 2 }} gap="md">
            {packageNames.map((name) => (
              <DashboardGrid.Item key={name}>
                <PackageCard name={name} fromMaintainer={username} />
              </DashboardGrid.Item>
            ))}
          </DashboardGrid>
        </Box>
      </main>
    </div>
  )
}
