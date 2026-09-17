import { useEffect, useRef } from 'react';
import { registerWebMcpTool, type WebMcpToolDescriptor } from '@/lib/webMcp';

/**
 * Registers a WebMCP tool for the lifetime of the component. `execute`
 * always runs the latest closure (via a ref) so the tool isn't
 * re-registered every time its dependencies change.
 */
export function useWebMcpTool<TInput>(descriptor: WebMcpToolDescriptor<TInput>): void {
  const descriptorRef = useRef(descriptor);
  descriptorRef.current = descriptor;

  useEffect(() => {
    return registerWebMcpTool({
      ...descriptorRef.current,
      execute: (input: TInput) => descriptorRef.current.execute(input),
    });
  }, []);
}
