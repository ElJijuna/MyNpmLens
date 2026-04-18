import { useNavigate } from '@tanstack/react-router'
import { Button, Icon } from '@gnome-ui/react'
import { Delete } from '@gnome-ui/icons'
import { CounterCard, PanelCard, UserCard } from '@gnome-ui/layout'
import { useNpmMaintainer, useNpmMaintainerPackages } from '@api-hooks/npm'
import { Toolbar } from '@/components/Toolbar'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { useRemoveMaintainer } from '@/modules/npm/hooks'
import { Route } from '@/routes/maintainers.$username'

export function MaintainerPage() {
  const { username } = Route.useParams()
  const navigate = useNavigate()
  const { data: user } = useNpmMaintainer(username)
  const { data: result } = useNpmMaintainerPackages(username)
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
      <Toolbar />

      <main className="page-content">
        <UserCard
          name={user?.name ?? username}
          email={user?.email}
          avatarSize="lg"
        />

        <div className="package-grid">
          <CounterCard label="Published packages" value={total} accent />
        </div>

        <PanelCard
          title="Published packages"
          collapsible={false}
          footerActions={
            <Button
              variant="destructive"
              leadingIcon={<Icon icon={Delete} />}
              onClick={handleUnfollow}
              disabled={removeMaintainer.isPending}
            >
              Unfollow
            </Button>
          }
        >
          <div className="package-grid">
            {packageNames.map((name) => (
              <PackageCard key={name} name={name} />
            ))}
          </div>
        </PanelCard>
      </main>
    </div>
  )
}
