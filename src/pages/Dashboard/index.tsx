import { useState } from 'react'
import { Toolbar } from '@/components/Toolbar'
import { AddPackageModal } from '@/components/AddPackageModal'
import { EmptyState } from '@/components/EmptyState'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { useFavorites } from '@/modules/npm/hooks'

export function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: favorites = [] } = useFavorites()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toolbar onAddClick={() => setModalOpen(true)} />

      <main className="page-content">
        {favorites.length === 0 ? (
          <EmptyState onAddClick={() => setModalOpen(true)} />
        ) : (
          <div className="package-grid">
            {favorites.map((fav) => (
              <PackageCard key={fav.name} name={fav.name} />
            ))}
          </div>
        )}
      </main>

      <AddPackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
