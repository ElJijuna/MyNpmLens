import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Box, Button, Icon, InlineViewSwitcher, InlineViewSwitcherItem, Spinner, Text, WrapBox } from '@gnome-ui/react'
import { Applications, Delete, Folder, Star, ViewSidebar } from '@gnome-ui/icons'
import { DashboardGrid, type DashboardGridLayout } from '@gnome-ui/layout/components/DashboardGrid'
import { StatCard } from '@gnome-ui/layout/components/StatCard'
import { useToast } from '@gnome-ui/layout/components/Toast'
import { useNpmMaintainer, useNpmMaintainerPackagesInfinite } from '@api-hooks/npm'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { DownloadsChart } from '@/modules/npm/components/DownloadsChart'
import { MaintainerAvatar } from '@/modules/npm/components/MaintainerAvatar'
import { useRemoveMaintainer } from '@/modules/npm/hooks'

const MAINTAINER_PACKAGE_PAGE_SIZE = 24

export function MaintainerPage() {
  const { t } = useTranslation()
  const { username } = useParams({ from: '/maintainers_/$username' })
  const navigate = useNavigate()
  const toast = useToast()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [packagesLayout, setPackagesLayout] = useState<DashboardGridLayout>('grid')
  const { data: user } = useNpmMaintainer(username)
  const packagesQuery = useNpmMaintainerPackagesInfinite(username, {
    size: MAINTAINER_PACKAGE_PAGE_SIZE,
    enabled: username.length > 0,
  })
  const removeMaintainer = useRemoveMaintainer()

  const packageObjects = packagesQuery.data?.pages.flatMap((page) => page.objects) ?? []
  const packageNames = packageObjects.map((o) => o.package.name)
  const total = packagesQuery.data?.pages[0]?.total ?? 0
  const scopedPackages = packageNames.filter((name) => name.startsWith('@')).length
  const averageScore = packageObjects.length > 0
    ? Math.round((packageObjects.reduce((sum, o) => sum + o.score.final, 0) / packageObjects.length) * 100)
    : 0
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = packagesQuery
  const canLoadMore = hasNextPage && !isFetchingNextPage

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasNextPage) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && canLoadMore) {
        void fetchNextPage()
      }
    }, { rootMargin: '240px' })

    observer.observe(node)

    return () => observer.disconnect()
  }, [canLoadMore, fetchNextPage, hasNextPage])

  function handleUnfollow() {
    removeMaintainer.mutate(username, {
      onSuccess: () => {
        toast.show({ title: t('maintainer.toastUnfollowed', { username }), type: 'info' })
        void navigate({ to: '/maintainers' })
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={24}>
          <WrapBox justify="space-between" align="center">
            <Box orientation="horizontal" spacing={12} style={{ alignItems: 'center' }}>
              <MaintainerAvatar username={username} name={user?.name} size="lg" />
              <Box orientation="vertical" spacing={2}>
                <Text variant="heading">{user?.name ?? username}</Text>
                {user?.email && <Text variant="caption" color="dim">{user.email}</Text>}
              </Box>
            </Box>
            <WrapBox childSpacing={8} align="center">
              <InlineViewSwitcher
                className="layout-switcher-mobile-hidden"
                value={packagesLayout}
                onValueChange={(value) => setPackagesLayout(value as DashboardGridLayout)}
                variant="pill"
                aria-label={t('dashboard.packageLayout')}
              >
                <InlineViewSwitcherItem name="grid" label={t('dashboard.gridView')} icon={Applications} />
                <InlineViewSwitcherItem name="column" label={t('dashboard.columnView')} icon={ViewSidebar} />
              </InlineViewSwitcher>
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
          </WrapBox>

          <DashboardGrid layout="grid" columns={{ sm: 1, md: 3 }} gap="sm">
            <DashboardGrid.Item>
              <StatCard
                label={t('maintainer.totalPackages')}
                value={total}
                unit={t('maintainer.packages').toLowerCase()}
                icon={<Icon icon={Applications} size="sm" />}
                loading={packagesQuery.isPending}
              />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <StatCard
                label={t('maintainer.scopedPackages')}
                value={scopedPackages}
                unit={t('maintainer.packages').toLowerCase()}
                icon={<Icon icon={Folder} size="sm" />}
                loading={packagesQuery.isPending}
              />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <StatCard
                label={t('maintainer.averageScore')}
                value={averageScore}
                unit="%"
                icon={<Icon icon={Star} size="sm" />}
                loading={packagesQuery.isPending}
              />
            </DashboardGrid.Item>
          </DashboardGrid>

          {packageNames.length > 0 && (
            <DownloadsChart packageNames={packageNames} />
          )}

          <Box spacing={12}>
            <Text variant="heading">{t('maintainer.packages')}</Text>

            <DashboardGrid layout={packagesLayout} columns={{ sm: 1, md: 2 }} gap="md">
              {packageNames.map((name) => (
                <DashboardGrid.Item key={name}>
                  <PackageCard name={name} fromMaintainer={username} />
                </DashboardGrid.Item>
              ))}
            </DashboardGrid>
          </Box>

          {packagesQuery.hasNextPage && (
            <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              {packagesQuery.isFetchingNextPage && <Spinner size="sm" />}
            </div>
          )}
        </Box>
      </main>
    </div>
  )
}
