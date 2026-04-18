import { logEvent } from 'firebase/analytics'
import { analytics } from '@/modules/auth/proxy/firebase'

export const Analytics = {
  addPackage: (name: string) => logEvent(analytics, 'add_package', { package_name: name }),
  addMaintainer: (username: string) => logEvent(analytics, 'add_maintainer', { username }),
  signIn: () => logEvent(analytics, 'login', { method: 'github' }),
  signOut: () => logEvent(analytics, 'sign_out'),
  appUpdate: () => logEvent(analytics, 'app_update'),
}
