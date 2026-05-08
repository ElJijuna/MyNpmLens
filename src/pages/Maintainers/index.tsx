import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Icon, InlineViewSwitcher, InlineViewSwitcherItem, StatusPage, Text, WrapBox } from '@gnome-ui/react'
import { Add, Applications, Star, ViewSidebar } from '@gnome-ui/icons'
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid'
import { AddMaintainerDialog } from '@/components/AddMaintainerDialog'
import { MaintainerCard } from '@/modules/npm/components/MaintainerCard'
import { MaintainersPackagesChart } from '@/modules/npm/components/MaintainersPackagesChart'
import { useMaintainers } from '@/modules/npm/hooks'

export function MaintainersPage() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [layout, setLayout] = useState<DashboardGridLayout>('grid')
  const { data: maintainers = [] } = useMaintainers()
  const usernames = maintainers.map((m) => m.username)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        {maintainers.length === 0 ? (
          <StatusPage
            icon={Star}
            title={t('maintainers.emptyTitle')}
            description={t('maintainers.emptyDescription')}
          >
            <Button variant="suggested" onClick={() => setDialogOpen(true)} leadingIcon={<Icon icon={Add} />}>
              {t('maintainers.addMaintainer')}
            </Button>
          </StatusPage>
        ) : (
          <Box>
            <WrapBox justify="space-between" align="center">
              <Text variant="heading">{t('maintainers.title')}</Text>
              <WrapBox childSpacing={8} align="center">
                <InlineViewSwitcher
                  value={layout}
                  onValueChange={(value) => setLayout(value as DashboardGridLayout)}
                  variant="pill"
                  aria-label={t('dashboard.packageLayout')}
                >
                  <InlineViewSwitcherItem name="grid" label={t('dashboard.gridView')} icon={Applications} />
                  <InlineViewSwitcherItem name="column" label={t('dashboard.columnView')} icon={ViewSidebar} />
                </InlineViewSwitcher>
                <Button
                  variant="suggested"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  leadingIcon={<Icon icon={Add} />}
                >
                  {t('maintainers.add')}
                </Button>
              </WrapBox>
            </WrapBox>

            <MaintainersPackagesChart usernames={usernames} />

            <DashboardGrid layout={layout} columns={{ sm: 2, md: 4 }} gap="md">
              {maintainers.map((m) => (
                <DashboardGrid.Item key={m.username}>
                  <MaintainerCard username={m.username} />
                </DashboardGrid.Item>
              ))}
            </DashboardGrid>
          </Box>
        )}
      </main>

      <AddMaintainerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
