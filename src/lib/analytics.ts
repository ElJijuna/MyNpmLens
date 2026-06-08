import { logEvent } from 'firebase/analytics';
import { analytics } from '@/modules/auth/proxy/firebase';

type AnalyticsValue = string | number | boolean | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

function track(eventName: string, params?: AnalyticsParams) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

function pageSection(pathname: string): string {
  if (pathname === '/') {
    return 'dashboard';
  }
  return pathname.split('/').filter(Boolean)[0] ?? 'unknown';
}

export const Analytics = {
  pageView: (pathname: string) =>
    track('page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
      page_section: pageSection(pathname),
    }),
  addPackage: (name: string, source = 'modal') =>
    track('add_package', { package_name: name, source }),
  removePackage: (name: string, source = 'package_detail') =>
    track('remove_package', { package_name: name, source }),
  packageVersionSelected: (name: string, version: string) =>
    track('package_version_selected', { package_name: name, version }),
  addMaintainer: (username: string, source = 'modal') =>
    track('add_maintainer', { username, source }),
  removeMaintainer: (username: string, source = 'maintainer_detail') =>
    track('remove_maintainer', { username, source }),
  layoutChanged: (surface: string, layout: string) => track('layout_changed', { surface, layout }),
  settingsChanged: (setting: string, value: string) =>
    track('settings_changed', { setting, value }),
  npmTokenSaved: (mode: 'create' | 'replace') => track('npm_token_saved', { mode }),
  npmTokenRevoked: () => track('npm_token_revoked'),
  syncToGist: (source: string) => track('sync_to_gist', { source }),
  signIn: () => track('login', { method: 'github' }),
  signOut: () => track('sign_out'),
  appUpdate: () => track('app_update'),
};
