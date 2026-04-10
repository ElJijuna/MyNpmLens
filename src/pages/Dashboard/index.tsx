import { useState } from 'react'
import { Toolbar } from '@/components/Toolbar'
import { AddPackageModal } from '@/components/AddPackageModal'
import { EmptyState } from '@/components/EmptyState'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { DownloadsChart } from '@/modules/npm/components/DownloadsChart'
import { AuthSection } from '@/modules/auth/components/AuthSection'
import { useFavorites } from '@/modules/npm/hooks'
import { useNativeEvent } from '@gnome-ui/hooks'

export function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: favorites = [] } = useFavorites()

  useNativeEvent('open-dialog-addpackage', () => setModalOpen(true))

  const packageNames = favorites.map((fav) => fav.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar onAddClick={() => setModalOpen(true)} />

      <main className="page-content">
        {favorites.length === 0 ? (
          <EmptyState onAddClick={() => setModalOpen(true)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <DownloadsChart packageNames={packageNames} />
            <div className="package-grid">
              {favorites.map((fav) => (
                <PackageCard key={fav.name} name={fav.name} />
              ))}
            </div>
          </div>
        )}
        <AuthSection />
      </main>

      <AddPackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
