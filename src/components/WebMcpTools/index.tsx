import { type AppTool, useAppTools } from '@/hooks/useAppTools';
import { useWebMcpTool } from '@/hooks/useWebMcpTool';
import type { WebMcpToolDescriptor } from '@/lib/webMcp';

function toWebMcpDescriptor(tool: AppTool): WebMcpToolDescriptor<Record<string, unknown>> {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: { readOnlyHint: tool.readOnly ?? false },
    execute: tool.execute,
  };
}

/**
 * Exposes My Npm Lens actions as WebMCP tools (document.modelContext)
 * so a browser AI agent can search, open, and favorite packages on the
 * user's behalf. Renders nothing; registration is a no-op when the
 * browser doesn't support WebMCP.
 */
export const WebMcpTools = () => {
  const tools = useAppTools();

  useWebMcpTool(toWebMcpDescriptor(tools.searchNpmPackages));
  useWebMcpTool(toWebMcpDescriptor(tools.openNpmPackage));
  useWebMcpTool(toWebMcpDescriptor(tools.addFavoritePackage));
  useWebMcpTool(toWebMcpDescriptor(tools.listFavoritePackages));

  return null;
};
