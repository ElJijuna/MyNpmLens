import type { FavoritePackage, FollowedMaintainer } from '@/modules/npm/domain';
import type { AppSettings } from '@/modules/settings/domain';
import { DEFAULT_SETTINGS } from '@/modules/settings/domain';

export interface GistContent {
  favorites: FavoritePackage[];
  maintainers: FollowedMaintainer[];
  settings: AppSettings;
}

export function parseGistContent(content: string): GistContent {
  try {
    const parsed = JSON.parse(content) as {
      favorites?: FavoritePackage[];
      maintainers?: FollowedMaintainer[];
      settings?: Partial<AppSettings>;
    };
    return {
      favorites: parsed.favorites ?? [],
      maintainers: parsed.maintainers ?? [],
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
    };
  } catch {
    return { favorites: [], maintainers: [], settings: DEFAULT_SETTINGS };
  }
}

export function stringifyGistContent(content: GistContent): string {
  return JSON.stringify(content, null, 2);
}
