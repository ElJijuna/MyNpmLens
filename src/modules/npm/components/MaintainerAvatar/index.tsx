import { useNpmMaintainerAvatar } from '@api-hooks/npm';
import { Avatar } from '@gnome-ui/react/components/Avatar';
import { useEffect, useState } from 'react';

interface MaintainerAvatarProps {
  username: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MaintainerAvatar = ({ username, name, size = 'md' }: MaintainerAvatarProps) => {
  const { data: avatarSrc } = useNpmMaintainerAvatar(username);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const displayName = name ?? username;

  useEffect(() => {
    void avatarSrc;
    setFailedSrc(null);
  }, [avatarSrc]);

  return (
    <Avatar
      name={displayName}
      src={failedSrc === avatarSrc ? undefined : avatarSrc}
      size={size}
      onError={() => {
        if (avatarSrc) {
          setFailedSrc(avatarSrc);
        }
      }}
    />
  );
};
