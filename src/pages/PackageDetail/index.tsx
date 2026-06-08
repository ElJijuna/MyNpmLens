import { useNpmPackage } from '@api-hooks/npm';
import { Applications, Delete, StarOutline, ViewSidebar } from '@gnome-ui/icons';
import { Npm } from '@gnome-ui/icons/third-party';
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid';
import { IconBadge } from '@gnome-ui/layout/components/IconBadge';
import {
  Box,
  Button,
  Dropdown,
  Icon,
  InlineViewSwitcher,
  InlineViewSwitcherItem,
  Text,
  WrapBox,
} from '@gnome-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getIcon } from 'very-simple-icons';
import { useAddFavorite, useFavorites, useRemoveFavorite } from '@/modules/npm/hooks';
import { Route } from '@/routes/packages.$name';
import { BundleSizeSection } from './sections/BundleSizeSection';
import { DependenciesSection } from './sections/DependenciesSection';
import { DownloadsSection } from './sections/DownloadsSection';
import { FilesSection } from './sections/FilesSection';
import { GitHubSection } from './sections/GitHubSection';
import { PackageInfoSection } from './sections/PackageInfoSection';
import { ScoreSection } from './sections/ScoreSection';
import { VulnerabilitySection } from './sections/VulnerabilitySection';

export const PackageDetailPage = () => {
  const { t } = useTranslation();
  const [sectionsLayout, setSectionsLayout] = useState<DashboardGridLayout>('grid');
  const { name } = Route.useParams();
  const { version: searchVersion, fromMaintainer } = Route.useSearch();
  const { data: pkg } = useNpmPackage(name);
  const { data: favorites = [] } = useFavorites();
  const navigate = useNavigate();
  const iconData = getIcon(name);

  const latestVersion = pkg?.['dist-tags']?.latest ?? '';
  const version = searchVersion ?? latestVersion;

  const versionList = pkg ? Object.keys(pkg.versions).reverse() : [];
  const versionOptions = versionList.map((v) => {
    const tag = Object.entries(pkg?.['dist-tags'] ?? {}).find(([, val]) => val === v)?.[0];
    return { value: v, label: tag ? `${v} (${tag})` : v };
  });

  const isFavorite = favorites.some((f) => f.name === name);
  const removeFavorite = useRemoveFavorite();
  const addFavorite = useAddFavorite();

  function handleVersionChange(v: string) {
    void navigate({
      to: '/packages/$name',
      params: { name },
      search: { version: v, fromMaintainer },
    });
  }

  function handleRemove() {
    removeFavorite.mutate(name, { onSuccess: () => navigate({ to: '/' }) });
  }

  function handleAdd() {
    addFavorite.mutate(name, { onSuccess: () => navigate({ to: '/' }) });
  }

  const actionButton = fromMaintainer ? (
    isFavorite ? (
      <Button
        variant="destructive"
        size="sm"
        leadingIcon={<Icon icon={Delete} />}
        onClick={handleRemove}
      >
        {t('packageDetail.removePackage')}
      </Button>
    ) : (
      <Button
        variant="suggested"
        size="sm"
        leadingIcon={<Icon icon={StarOutline} />}
        onClick={handleAdd}
        disabled={addFavorite.isPending}
      >
        {t('packageDetail.addPackage')}
      </Button>
    )
  ) : (
    <Button
      variant="destructive"
      size="sm"
      leadingIcon={<Icon icon={Delete} />}
      onClick={handleRemove}
    >
      {t('packageDetail.removePackage')}
    </Button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={24}>
          <WrapBox justify="space-between" align="center">
            <WrapBox align="center" childSpacing={12}>
              <IconBadge color={iconData?.hex ? `#${iconData.hex}` : 'blue'} size="lg">
                <Icon icon={iconData ? { path: iconData.path } : Npm} />
              </IconBadge>
              {versionOptions.length > 0 && (
                <>
                  <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>
                    {t('packageDetail.version')}
                  </Text>
                  <Dropdown
                    aria-label={t('packageDetail.selectVersion')}
                    options={versionOptions}
                    value={version || latestVersion}
                    onChange={handleVersionChange}
                  />
                  <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>
                    {versionList.length} {t('packageDetail.published')}
                  </Text>
                </>
              )}
            </WrapBox>
            <WrapBox childSpacing={8} align="center">
              <InlineViewSwitcher
                className="layout-switcher-mobile-hidden"
                value={sectionsLayout}
                onValueChange={(value) => setSectionsLayout(value as DashboardGridLayout)}
                variant="pill"
                aria-label={t('dashboard.packageLayout')}
              >
                <InlineViewSwitcherItem
                  name="grid"
                  label={t('dashboard.gridView')}
                  icon={Applications}
                />
                <InlineViewSwitcherItem
                  name="column"
                  label={t('dashboard.columnView')}
                  icon={ViewSidebar}
                />
              </InlineViewSwitcher>
              {actionButton}
            </WrapBox>
          </WrapBox>

          <DashboardGrid layout={sectionsLayout} columns={{ sm: 1, md: 2, xxl: 4 }} gap="md">
            <DashboardGrid.Item style={{ gridColumn: '1 / -1' }}>
              <PackageInfoSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <ScoreSection name={name} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <DownloadsSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <BundleSizeSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <GitHubSection packageName={name} />
            </DashboardGrid.Item>
            <DashboardGrid.Item style={{ gridColumn: '1 / -1' }}>
              <VulnerabilitySection packageName={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item style={{ gridColumn: '1 / -1' }}>
              <DependenciesSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item style={{ gridColumn: '1 / -1' }}>
              <FilesSection name={name} version={version} />
            </DashboardGrid.Item>
          </DashboardGrid>
        </Box>
      </main>
    </div>
  );
};
