import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Icon, WrapBox, Text } from '@gnome-ui/react'
import { Add } from '@gnome-ui/icons'
import { Toolbar } from '@/components/Toolbar'
import { AddPackageModal } from '@/components/AddPackageModal'
import { EmptyState } from '@/components/EmptyState'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { DownloadsChart } from '@/modules/npm/components/DownloadsChart'
import { AuthSection } from '@/modules/auth/components/AuthSection'
import { useFavorites } from '@/modules/npm/hooks'
import { useNativeEvent } from '@gnome-ui/hooks'

export function DashboardPage() {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const { data: favorites = [] } = useFavorites()

  useNativeEvent('open-dialog-addpackage', () => setModalOpen(true))

  const packageNames = favorites.map((fav) => fav.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content">
        {favorites.length === 0 ? (
          <EmptyState onAddClick={() => setModalOpen(true)} />
        ) : (
          <Box>
            <WrapBox justify="space-between" align="center">
              <Text variant="heading">
                {t('dashboard.favoritePackages')}
              </Text>
              <Button
                variant="suggested"
                size="sm"
                onClick={() => setModalOpen(true)}
                leadingIcon={<Icon icon={Add} />}
              >
                {t('dashboard.add')}
              </Button>
            </WrapBox>
            <DownloadsChart packageNames={packageNames} />

            <div className="package-grid">
              {favorites.map((fav) => (
                <PackageCard key={fav.name} name={fav.name} />
              ))}
            </div>
          </Box>
        )}
        <AuthSection />
      </main>

      <AddPackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
