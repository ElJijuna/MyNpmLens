import { EntityCard } from '@gnome-ui/layout/components/EntityCard'
import { useNavigate } from '@tanstack/react-router'
import { useNpmMaintainer, useNpmMaintainerPackages } from '@api-hooks/npm'
import { MaintainerAvatar } from '@/modules/npm/components/MaintainerAvatar'
import { useFormatters } from '@/hooks/useFormatters'

interface MaintainerCardProps {
  username: string
}

export function MaintainerCard({ username }: MaintainerCardProps) {
  const navigate = useNavigate()
  const { formatCompactNumber } = useFormatters()
  const { data: user } = useNpmMaintainer(username)
  const { data: packages } = useNpmMaintainerPackages(username)

  const packagesStr = packages ? `${formatCompactNumber(packages.total)} packages` : undefined

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
