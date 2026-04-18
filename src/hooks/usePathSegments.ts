import { useLocation } from '@tanstack/react-router'
import type { PathBarSegment } from '@gnome-ui/react'

const HOME: PathBarSegment = { label: 'Home', path: '/' }

export function usePathSegments(): PathBarSegment[] {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length === 0) return [HOME]

  switch (parts[0]) {
    case 'maintainers':
      if (parts[1]) {
        return [HOME, { label: 'Maintainers', path: '/maintainers' }, { label: parts[1], path: `/maintainers/${parts[1]}` }]
      }
      return [HOME, { label: 'Maintainers', path: '/maintainers' }]

    case 'package':
      if (parts[1]) {
        return [HOME, { label: decodeURIComponent(parts[1]), path: `/package/${parts[1]}` }]
      }
      return [HOME]

    case 'about':
      return [HOME, { label: 'About', path: '/about' }]

    case 'profile':
      return [HOME, { label: 'Profile', path: '/profile' }]

    case 'settings':
      return [HOME, { label: 'Settings', path: '/settings' }]

    default:
      return [HOME]
  }
}
