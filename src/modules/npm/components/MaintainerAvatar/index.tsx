import { useEffect, useState } from 'react'
import { Avatar } from '@gnome-ui/react/components/Avatar'
import { useNpmMaintainerAvatar } from '@api-hooks/npm'

interface MaintainerAvatarProps {
  username: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MaintainerAvatar({ username, name, size = 'md' }: MaintainerAvatarProps) {
  const avatarSrc = useNpmMaintainerAvatar(username)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const displayName = name ?? username

  useEffect(() => {
    setFailedSrc(null)
  }, [avatarSrc])

  return (
    <Avatar
      name={displayName}
      src={failedSrc === avatarSrc ? undefined : avatarSrc}
      size={size}
      onError={() => setFailedSrc(avatarSrc)}
    />
  )
}
