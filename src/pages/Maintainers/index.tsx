import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, Box, Button, Card, Icon, StatusPage, Text, WrapBox } from '@gnome-ui/react'
import { Add, Star } from '@gnome-ui/icons'
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
        {maintainers.length === 0 ? (
          <StatusPage
            icon={Star}
            title="No maintainers yet"
            description="Follow npm maintainers to track their published packages."
          >
            <Button variant="suggested" onClick={() => setDialogOpen(true)} leadingIcon={<Icon icon={Add} />}>
              Add maintainer
            </Button>
          </StatusPage>
        ) : (
          <Box>
            <WrapBox justify="space-between" align="center">
              <Text variant="heading">Maintainers</Text>
              <Button
                variant="suggested"
                size="sm"
                onClick={() => setDialogOpen(true)}
                leadingIcon={<Icon icon={Add} />}
              >
                Add
              </Button>
            </WrapBox>

            <div className="maintainer-grid">
              {maintainers.map((m) => (
                <Card
                  key={m.username}
                  interactive
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate({ to: '/maintainers/$username', params: { username: m.username } })}
                >
                  <Box orientation="vertical" spacing={8} style={{ alignItems: 'center', padding: '0.5rem 0' }}>
                    <Avatar name={m.username} size="lg" />
                    <Text variant="caption-heading">{m.username}</Text>
                  </Box>
                </Card>
              ))}
            </div>
          </Box>
        )}
      </main>

      <AddMaintainerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
