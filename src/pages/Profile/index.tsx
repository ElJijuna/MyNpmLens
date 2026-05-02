import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, Button, Icon, Text, WrapBox } from '@gnome-ui/react'
import { Delete } from '@gnome-ui/icons'
import { Toolbar } from '@/components/Toolbar'
import { useAuth } from '@/modules/auth/AuthProvider'
import { useSignOut } from '@/modules/auth/hooks'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => navigate({ to: '/' }),
    })
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content">
        <Box spacing={16}>
          <WrapBox justify="space-between" align="center">
            <Box orientation="horizontal" spacing={12} style={{ alignItems: 'center' }}>
              <Avatar src={user.photoURL ?? undefined} name={user.displayName ?? user.email ?? '?'} size="lg" />
              <Box orientation="vertical" spacing={2}>
                <Text variant="heading">{user.displayName ?? user.email}</Text>
                {user.email && <Text variant="caption" color="dim">{user.email}</Text>}
              </Box>
            </Box>
            <Button
              variant="destructive"
              size="sm"
              leadingIcon={<Icon icon={Delete} />}
              onClick={handleSignOut}
              disabled={signOut.isPending}
            >
              {t('profile.signOut')}
            </Button>
          </WrapBox>
        </Box>
      </main>
    </div>
  )
}
