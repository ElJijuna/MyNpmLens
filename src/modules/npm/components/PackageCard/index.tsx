import { useNpmPackage, useNpmPackageDownloads } from '@api-hooks/npm';
import { Star } from '@gnome-ui/icons';
import { Npm } from '@gnome-ui/icons/third-party';
import { EntityCard } from '@gnome-ui/layout/components/EntityCard';
import { IconBadge } from '@gnome-ui/layout/components/IconBadge';
import { Icon } from '@gnome-ui/react/components/Icon';
import { StatusBadge } from '@gnome-ui/react/components/StatusBadge';
import { Text } from '@gnome-ui/react/components/Text';
import { useNavigate } from '@tanstack/react-router';
import { getIcon } from 'very-simple-icons';
import { useFormatters } from '@/hooks/useFormatters';
import { useGitHubStats } from '@/modules/github/hooks';
import { parseGitHubSlug } from '@/modules/github/utils/parseGitHubSlug';

interface PackageCardProps {
  name: string;
  fromMaintainer?: string;
}

export const PackageCard = ({ name, fromMaintainer }: PackageCardProps) => {
  const navigate = useNavigate();
  const { formatCompactNumber } = useFormatters();
  const iconData = getIcon(name);
  const { data: pkg } = useNpmPackage(name);
  const { data: weekly } = useNpmPackageDownloads(name, { period: 'last-week' });
  const slug = pkg?.repository?.url ? parseGitHubSlug(pkg.repository.url) : null;
  const { data: github } = useGitHubStats(slug?.owner ?? null, slug?.repo ?? null);

  const version = pkg?.['dist-tags']?.latest;
  const versionCount = pkg ? Object.keys(pkg.versions).length : 0;
  const versionStr = version
    ? `v${version}${versionCount > 0 ? ` · ${versionCount} versions` : ''}`
    : undefined;
  const downloadsStr = weekly ? `↓ ${formatCompactNumber(weekly.downloads)}/wk` : undefined;

  return (
    <EntityCard
      avatar={
        <IconBadge color={iconData?.hex ? `#${iconData.hex}` : 'blue'} size="lg">
          <Icon icon={iconData ? { path: iconData.path } : Npm} />
        </IconBadge>
      }
      title={name}
      badge={pkg?.license ? <StatusBadge variant="accent">{pkg.license}</StatusBadge> : undefined}
      description={pkg?.description}
      meta={[versionStr, downloadsStr]}
      trailing={
        github ? (
          <Text
            variant="caption"
            color="dim"
            style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <Icon icon={Star} size="sm" />
            {formatCompactNumber(github.stars)}
          </Text>
        ) : undefined
      }
      onClick={() =>
        navigate({
          to: '/packages/$name',
          params: { name },
          search: { version: undefined, fromMaintainer },
        })
      }
      aria-label={`View details for ${name}`}
    />
  );
};
