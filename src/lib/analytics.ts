import { logEvent } from 'firebase/analytics';
import { analytics } from '@/modules/auth/proxy/firebase';

export const Analytics = {
  addPackage: (name: string) =>
    analytics && logEvent(analytics, 'add_package', { package_name: name }),
  addMaintainer: (username: string) =>
    analytics && logEvent(analytics, 'add_maintainer', { username }),
  signIn: () => analytics && logEvent(analytics, 'login', { method: 'github' }),
  signOut: () => analytics && logEvent(analytics, 'sign_out'),
  appUpdate: () => analytics && logEvent(analytics, 'app_update'),
};
