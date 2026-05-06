import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, Button, Icon, Text, WrapBox } from '@gnome-ui/react'
import { Delete } from '@gnome-ui/icons'
import { CounterCard } from '@gnome-ui/layout/components/CounterCard'
import { DashboardGrid } from '@gnome-ui/layout/components/DashboardGrid'
import { useNpmMaintainer, useNpmMaintainerPackages, useNpmMaintainerAvatar } from '@api-hooks/npm'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { useRemoveMaintainer } from '@/modules/npm/hooks'

export function MaintainerPage() {
  const { t } = useTranslation()
  const { username } = useParams({ from: '/maintainers_/$username' })
  const navigate = useNavigate()
  const { data: user } = useNpmMaintainer(username)
  const { data: result } = useNpmMaintainerPackages(username)
  const avatarSrc = useNpmMaintainerAvatar(username)
  const removeMaintainer = useRemoveMaintainer()

  const packageNames = result?.objects.map((o) => o.package.name) ?? []
  const total = result?.total ?? 0

  function handleUnfollow() {
    removeMaintainer.mutate(username, {
      onSuccess: () => navigate({ to: '/maintainers' }),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={16}>
          <WrapBox justify="space-between" align="center">
            <Box orientation="horizontal" spacing={12} style={{ alignItems: 'center' }}>
              <Avatar name={user?.name ?? username} src={avatarSrc} size="lg" />
              <Box orientation="vertical" spacing={2}>
                <Text variant="heading">{user?.name ?? username}</Text>
                {user?.email && <Text variant="caption" color="dim">{user.email}</Text>}
              </Box>
            </Box>
            <Button
              variant="destructive"
              size="sm"
              leadingIcon={<Icon icon={Delete} />}
              onClick={handleUnfollow}
              disabled={removeMaintainer.isPending}
            >
              {t('maintainer.unfollow')}
            </Button>
          </WrapBox>

          <DashboardGrid columns={{ sm: 1, md: 2 }} gap="sm" style={{ maxWidth: '400px' }}>
            <DashboardGrid.Item span={1}>
              <CounterCard label="" value={total} accent animated suffix={` ${t('maintainer.packages').toLowerCase()}`} duration={5000} />
            </DashboardGrid.Item>
          </DashboardGrid>

          <Text variant="heading">{t('maintainer.packages')}</Text>

          <DashboardGrid columns={{ sm: 1, md: 2 }} gap="md">
            {packageNames.map((name) => (
              <DashboardGrid.Item key={name}>
                <PackageCard name={name} fromMaintainer={username} />
              </DashboardGrid.Item>
            ))}
          </DashboardGrid>
        </Box>
      </main>
    </div>
  )
}
