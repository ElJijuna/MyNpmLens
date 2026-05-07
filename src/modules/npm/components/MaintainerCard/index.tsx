import { EntityCard } from '@gnome-ui/layout/components/EntityCard'
import { useNavigate } from '@tanstack/react-router'
import { useNpmMaintainer, useNpmMaintainerPackages } from '@api-hooks/npm'
import { MaintainerAvatar } from '@/modules/npm/components/MaintainerAvatar'

interface MaintainerCardProps {
  username: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function MaintainerCard({ username }: MaintainerCardProps) {
  const navigate = useNavigate()
  const { data: user } = useNpmMaintainer(username)
  const { data: packages } = useNpmMaintainerPackages(username)

  const packagesStr = packages ? `${formatNumber(packages.total)} packages` : undefined

  return (
    <EntityCard
      avatar={<MaintainerAvatar username={username} name={user?.name} size="md" />}
      title={user?.name ?? username}
      subtitle={`@${username}`}
      meta={[packagesStr, user?.email]}
      onClick={() => navigate({ to: '/maintainers/$username', params: { username } })}
      aria-label={`View details for ${username}`}
    />
  )
}
