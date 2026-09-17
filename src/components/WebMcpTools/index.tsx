import { useNpmClient } from '@api-hooks/npm';
import { useNavigate } from '@tanstack/react-router';
import { useWebMcpTool } from '@/hooks/useWebMcpTool';
import { textResult } from '@/lib/webMcp';
import { useAddFavorite, useFavorites } from '@/modules/npm/hooks';

const MAX_SEARCH_RESULTS = 20;

/**
 * Exposes My Npm Lens actions as WebMCP tools (document.modelContext)
 * so a browser AI agent can search, open, and favorite packages on the
 * user's behalf. Renders nothing; registration is a no-op when the
 * browser doesn't support WebMCP.
 */
export const WebMcpTools = () => {
  const navigate = useNavigate();
  const client = useNpmClient();
  const { data: favorites = [] } = useFavorites();
  const addFavorite = useAddFavorite();

  useWebMcpTool<{ query: string; size?: number }>({
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
    annotations: { readOnlyHint: true },
    execute: async ({ query, size }) => {
      const result = await client.search({
        text: query,
        size: Math.min(size ?? 10, MAX_SEARCH_RESULTS),
      });
      const lines = result.objects.map(
        (item) => `${item.package.name} — ${item.package.description ?? 'No description'}`,
      );
      return textResult(lines.length > 0 ? lines.join('\n') : `No packages found for "${query}".`);
    },
  });

  useWebMcpTool<{ name: string }>({
    name: 'open_npm_package',
    description: "Navigate the app to a package's detail page.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The exact npm package name, e.g. "react".' },
      },
      required: ['name'],
    },
    annotations: { readOnlyHint: false },
    execute: ({ name }) => {
      navigate({
        to: '/packages/$name',
        params: { name },
        search: { version: undefined, fromMaintainer: undefined },
      });
      return textResult(`Opened the detail page for "${name}".`);
    },
  });

  useWebMcpTool<{ name: string }>({
    name: 'add_favorite_package',
    description: "Add an npm package to the user's favorites list.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The exact npm package name to favorite.' },
      },
      required: ['name'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ name }) => {
      await addFavorite.mutateAsync(name);
      return textResult(`Added "${name}" to favorites.`);
    },
  });

  useWebMcpTool({
    name: 'list_favorite_packages',
    description: "List the user's favorited npm packages.",
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: () => {
      const names = favorites.map((favorite) => favorite.name);
      return textResult(names.length > 0 ? names.join(', ') : 'No favorite packages yet.');
    },
  });

  return null;
};
