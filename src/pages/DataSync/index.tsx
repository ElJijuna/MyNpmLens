import { useTranslation } from 'react-i18next'
import { PreferencesGroup } from '@gnome-ui/react/components/PreferencesGroup'
import { BoxedList } from '@gnome-ui/react/components/BoxedList'
import { ActionRow } from '@gnome-ui/react/components/ActionRow'
import { Box } from '@gnome-ui/react/components/Box'
import { Button } from '@gnome-ui/react/components/Button'
import { Badge } from '@gnome-ui/react/components/Badge'
import { Avatar } from '@gnome-ui/react/components/Avatar'
import { Icon } from '@gnome-ui/react/components/Icon'
import { IconBadge } from '@gnome-ui/layout/components/IconBadge'
import { Npm } from '@gnome-ui/icons/third-party'
import { getIcon } from 'very-simple-icons'
import { useFavorites } from '@/modules/npm/hooks/useFavorites'
import { useMaintainers } from '@/modules/npm/hooks/useMaintainers'
import { useGistSync } from '@/modules/gist/hooks/useGistSync'
import { usePushToGist } from '@/modules/gist/hooks/usePushToGist'
import { useFormatters } from '@/hooks/useFormatters'

export function DataSyncPage() {
  const { t } = useTranslation()
  const { formatDate } = useFormatters()
  const { data: localFavorites = [] } = useFavorites()
  const { data: localMaintainers = [] } = useMaintainers()
  const { delta, gistFavorites, gistMaintainers } = useGistSync()
  const pushToGist = usePushToGist()

  const allPackages = [
    ...localFavorites,
    ...gistFavorites.filter((g) => !localFavorites.find((l) => l.name === g.name)),
  ]

  const allMaintainers = [
    ...localMaintainers,
    ...gistMaintainers.filter((g) => !localMaintainers.find((l) => l.username === g.username)),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={16}>
          <PreferencesGroup title={t('sync.packagesGroup')}>
            <BoxedList>
              {allPackages.map((pkg) => {
                const isNew = delta.addedInGist.some((g) => g.name === pkg.name)
                const isOnlyLocal = delta.removedInGist.some((l) => l.name === pkg.name)
                const date = pkg.addedAt ? formatDate(pkg.addedAt) : undefined
                const iconData = getIcon(pkg.name)
                return (
                  <ActionRow
                    key={pkg.name}
                    title={pkg.name}
                    subtitle={date ? t('sync.addedAt', { date }) : undefined}
                    leading={
                      <IconBadge color={iconData?.hex ? `#${iconData.hex}` : 'blue'} size="sm">
                        <Icon icon={iconData ? { path: iconData.path } : Npm} />
                      </IconBadge>
                    }
                    trailing={
                      isNew ? (
                        <Badge variant="success">{t('sync.badgeNew')}</Badge>
                      ) : isOnlyLocal ? (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={pushToGist.isPending}
                          onClick={() => pushToGist.mutate()}
                        >
                          {t('sync.saveToGist')}
                        </Button>
                      ) : undefined
                    }
                  />
                )
              })}
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('sync.maintainersGroup')}>
            <BoxedList>
              {allMaintainers.map((m) => {
                const isNew = delta.addedMaintainersInGist.some((g) => g.username === m.username)
                const isOnlyLocal = delta.removedMaintainersInGist.some((l) => l.username === m.username)
                const date = m.addedAt ? formatDate(m.addedAt) : undefined
                return (
                  <ActionRow
                    key={m.username}
                    title={m.username}
                    subtitle={date ? t('sync.addedAt', { date }) : undefined}
                    leading={<Avatar name={m.username} size="sm" />}
                    trailing={
                      isNew ? (
                        <Badge variant="success">{t('sync.badgeNew')}</Badge>
                      ) : isOnlyLocal ? (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={pushToGist.isPending}
                          onClick={() => pushToGist.mutate()}
                        >
                          {t('sync.saveToGist')}
                        </Button>
                      ) : undefined
                    }
                  />
                )
              })}
            </BoxedList>
          </PreferencesGroup>
        </Box>
      </main>
    </div>
  )
}
