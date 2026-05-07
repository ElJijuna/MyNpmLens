import { Avatar } from '@gnome-ui/react/components/Avatar'
import { EntityCard } from '@gnome-ui/layout/components/EntityCard'
import { useNavigate } from '@tanstack/react-router'
import { useNpmMaintainer, useNpmMaintainerAvatar, useNpmMaintainerPackages } from '@api-hooks/npm'

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
  const avatarSrc = useNpmMaintainerAvatar(username)
  const { data: user } = useNpmMaintainer(username)
  const { data: packages } = useNpmMaintainerPackages(username)

  const packagesStr = packages ? `${formatNumber(packages.total)} packages` : undefined

  return (
    <EntityCard
      avatar={<Avatar name={user?.name ?? username} src={avatarSrc} size="md" />}
      title={user?.name ?? username}
      subtitle={`@${username}`}
      meta={[packagesStr, user?.email]}
      onClick={() => navigate({ to: '/maintainers/$username', params: { username } })}
      aria-label={`View details for ${username}`}
    />
  )
}
