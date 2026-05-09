import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Icon, InlineViewSwitcher, InlineViewSwitcherItem, WrapBox, Text } from '@gnome-ui/react'
import { Add, Applications, ViewSidebar } from '@gnome-ui/icons'
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid'
import { AddPackageModal } from '@/components/AddPackageModal'
import { EmptyState } from '@/components/EmptyState'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { DownloadsChart } from '@/modules/npm/components/DownloadsChart'
import { AuthSection } from '@/modules/auth/components/AuthSection'
import { useFavorites } from '@/modules/npm/hooks'
import { useNativeEvent } from '@gnome-ui/hooks'

export function FavoritesPage() {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [packagesLayout, setPackagesLayout] = useState<DashboardGridLayout>('grid')
  const { data: favorites = [] } = useFavorites()

  useNativeEvent('open-dialog-addpackage', () => setModalOpen(true))

  const packageNames = favorites.map((fav) => fav.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        {favorites.length === 0 ? (
          <EmptyState onAddClick={() => setModalOpen(true)} />
        ) : (
          <Box spacing={24}>
            <WrapBox justify="space-between" align="center">
              <Text variant="heading">
                {t('favorites.favoritePackages')}
              </Text>
              <WrapBox childSpacing={8} align="center">
                <InlineViewSwitcher
                  className="layout-switcher-mobile-hidden"
                  value={packagesLayout}
                  onValueChange={(value) => setPackagesLayout(value as DashboardGridLayout)}
                  variant="pill"
                  aria-label={t('favorites.packageLayout')}
                >
                  <InlineViewSwitcherItem name="grid" label={t('favorites.gridView')} icon={Applications} />
                  <InlineViewSwitcherItem name="column" label={t('favorites.columnView')} icon={ViewSidebar} />
                </InlineViewSwitcher>
                <Button
                  variant="suggested"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  leadingIcon={<Icon icon={Add} />}
                >
                  {t('favorites.add')}
                </Button>
              </WrapBox>
            </WrapBox>
            <DownloadsChart packageNames={packageNames} />

            <DashboardGrid layout={packagesLayout} columns={{ sm: 1, md: 2 }} gap="md">
              {favorites.map((fav) => (
                <DashboardGrid.Item key={fav.name}>
                  <PackageCard name={fav.name} />
                </DashboardGrid.Item>
              ))}
            </DashboardGrid>
          </Box>
        )}
        <AuthSection />
      </main>

      <AddPackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
