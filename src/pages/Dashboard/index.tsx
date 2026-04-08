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

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {favorites.length === 0 ? (
          <EmptyState onAddClick={() => setModalOpen(true)} />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
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
