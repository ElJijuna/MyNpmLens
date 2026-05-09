import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { PathBarSegment } from '@gnome-ui/react'

export function usePathSegments(): PathBarSegment[] {
  const { t } = useTranslation()
  const location = useRouterState({ select: (s) => s.location })
  const { pathname, search } = location
  const parts = pathname.split('/').filter(Boolean)

  const HOME: PathBarSegment = { label: t('nav.home'), path: '/' }

  if (parts.length === 0) return [HOME]

  switch (parts[0]) {
    case 'maintainers':
      if (parts[1]) {
        return [HOME, { label: t('nav.maintainers'), path: '/maintainers' }, { label: parts[1], path: `/maintainers/${parts[1]}` }]
      }
      return [HOME, { label: t('nav.maintainers'), path: '/maintainers' }]

    case 'packages':
      if (parts[1]) {
        const params = new URLSearchParams(search)
        const fromMaintainer = params.get('fromMaintainer')
        if (fromMaintainer) {
          return [
            { label: t('nav.maintainers'), path: '/maintainers' },
            { label: fromMaintainer, path: `/maintainers/${fromMaintainer}` },
            { label: decodeURIComponent(parts[1]), path: `/packages/${parts[1]}` },
          ]
        }
        return [HOME, { label: decodeURIComponent(parts[1]), path: `/packages/${parts[1]}` }]
      }
      return [HOME]

    case 'about':
      return [HOME, { label: t('nav.about'), path: '/about' }]

    case 'favorites':
      return [HOME, { label: t('nav.favorites'), path: '/favorites' }]

    case 'profile':
      return [HOME, { label: t('nav.profile'), path: '/profile' }]

    case 'settings':
      return [HOME, { label: t('nav.settings'), path: '/settings' }]

    default:
      return [HOME]
  }
}
