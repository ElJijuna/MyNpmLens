import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, Button, Card, Icon, InlineViewSwitcher, InlineViewSwitcherItem, StatusPage, Text, WrapBox } from '@gnome-ui/react'
import { Add, Applications, Star, ViewSidebar } from '@gnome-ui/icons'
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid'
import { AddMaintainerDialog } from '@/components/AddMaintainerDialog'
import { useMaintainers } from '@/modules/npm/hooks'

export function MaintainersPage() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [layout, setLayout] = useState<DashboardGridLayout>('grid')
  const { data: maintainers = [] } = useMaintainers()
  const navigate = useNavigate()

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

            <DashboardGrid layout={layout} columns={{ sm: 2, md: 4 }} gap="md">
              {maintainers.map((m) => (
                <DashboardGrid.Item key={m.username}>
                  <Card
                    interactive
                    style={{ cursor: 'pointer', height: '100%' }}
                    onClick={() => navigate({ to: '/maintainers/$username', params: { username: m.username } })}
                  >
                    <Box orientation="vertical" spacing={8} style={{ alignItems: 'center', padding: '0.5rem 0' }}>
                      <Avatar name={m.username} size="lg" />
                      <Text variant="caption-heading">{m.username}</Text>
                    </Box>
                  </Card>
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
