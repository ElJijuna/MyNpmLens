import { useNpmClient } from '@api-hooks/npm';
import { useNavigate } from '@tanstack/react-router';
import { useAddFavorite, useFavorites } from '@/modules/npm/hooks';

const MAX_SEARCH_RESULTS = 20;

export interface AppTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  readOnly?: boolean;
  execute: (input: Record<string, unknown>) => Promise<string>;
}

export interface AppTools {
  searchNpmPackages: AppTool;
  openNpmPackage: AppTool;
  addFavoritePackage: AppTool;
  listFavoritePackages: AppTool;
}

/**
 * Actions My Npm Lens can perform on the user's behalf. Shared by
 * WebMCP (for external browser agents) and the in-page AI chat, so
 * both surfaces expose the exact same capabilities. Tool arguments
 * arrive as untyped JSON (from an agent or a parsed model response),
 * so each `execute` casts its own input shape.
 */
export function useAppTools(): AppTools {
  const navigate = useNavigate();
  const client = useNpmClient();
  const { data: favorites = [] } = useFavorites();
  const addFavorite = useAddFavorite();

  return {
    searchNpmPackages: {
      name: 'search_npm_packages',
      description: 'Search npm packages by name or keyword and return the top matches.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search text, e.g. a package name or keyword.' },
          size: {
            type: 'number',
            description: `Max number of results (default 10, max ${MAX_SEARCH_RESULTS}).`,
            minimum: 1,
            maximum: MAX_SEARCH_RESULTS,
          },
        },
        required: ['query'],
      },
      readOnly: true,
      execute: async (input) => {
        const { query, size } = input as { query: string; size?: number };
        const result = await client.search({
          text: query,
          size: Math.min(size ?? 10, MAX_SEARCH_RESULTS),
        });
        const lines = result.objects.map(
          (item) => `${item.package.name} — ${item.package.description ?? 'No description'}`,
        );
        return lines.length > 0 ? lines.join('\n') : `No packages found for "${query}".`;
      },
    },
    openNpmPackage: {
      name: 'open_npm_package',
      description: "Navigate the app to a package's detail page.",
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The exact npm package name, e.g. "react".' },
        },
        required: ['name'],
      },
      execute: async (input) => {
        const { name } = input as { name: string };
        await navigate({
          to: '/packages/$name',
          params: { name },
          search: { version: undefined, fromMaintainer: undefined },
        });
        return `Opened the detail page for "${name}".`;
      },
    },
    addFavoritePackage: {
      name: 'add_favorite_package',
      description: "Add an npm package to the user's favorites list.",
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The exact npm package name to favorite.' },
        },
        required: ['name'],
      },
      execute: async (input) => {
        const { name } = input as { name: string };
        await addFavorite.mutateAsync(name);
        return `Added "${name}" to favorites.`;
      },
    },
    listFavoritePackages: {
      name: 'list_favorite_packages',
      description: "List the user's favorited npm packages.",
      inputSchema: { type: 'object', properties: {} },
      readOnly: true,
      execute: async () => {
        const names = favorites.map((favorite) => favorite.name);
        return names.length > 0 ? names.join(', ') : 'No favorite packages yet.';
      },
    },
  };
}
