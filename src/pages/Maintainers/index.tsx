import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button, Icon } from '@gnome-ui/react'
import { Add } from '@gnome-ui/icons'
import { PanelCard, UserCard } from '@gnome-ui/layout'
import { Toolbar } from '@/components/Toolbar'
import { AddMaintainerDialog } from '@/components/AddMaintainerDialog'
import { useMaintainers } from '@/modules/npm/hooks'

export function MaintainersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: maintainers = [] } = useMaintainers()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content">
        <PanelCard
          title="Following"
          collapsible={false}
          headerActions={
            <Button
              variant="suggested"
              size="sm"
              onClick={() => setDialogOpen(true)}
              leadingIcon={<Icon icon={Add} />}
            >
              Add maintainer
            </Button>
          }
        >
          <div className="package-grid">
            {maintainers.map((m) => (
              <UserCard
                key={m.username}
                name={m.username}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate({ to: '/maintainers/$username', params: { username: m.username } })}
              />
            ))}
          </div>
        </PanelCard>
      </main>

      <AddMaintainerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
