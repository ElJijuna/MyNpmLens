export interface WebMcpContent {
  type: 'text';
  text: string;
}

export interface WebMcpToolResult {
  content: WebMcpContent[];
}

export interface WebMcpToolDescriptor<TInput = Record<string, unknown>> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: TInput) => Promise<WebMcpToolResult> | WebMcpToolResult;
}

interface ModelContext {
  registerTool(
    descriptor: WebMcpToolDescriptor<never>,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

export function isWebMcpSupported(): boolean {
  return typeof document !== 'undefined' && 'modelContext' in document;
}

export function textResult(text: string): WebMcpToolResult {
  return { content: [{ type: 'text', text }] };
}

/**
 * Registers a WebMCP tool (document.modelContext.registerTool) so an
 * agent operating the browser can act on the page. No-ops when the API
 * isn't supported. Returns a function that unregisters the tool.
 */
export function registerWebMcpTool<TInput>(descriptor: WebMcpToolDescriptor<TInput>): () => void {
  if (!isWebMcpSupported()) {
    return () => {};
  }

  const controller = new AbortController();
  void document.modelContext?.registerTool(descriptor as WebMcpToolDescriptor<never>, {
    signal: controller.signal,
  });

  return () => controller.abort();
}
