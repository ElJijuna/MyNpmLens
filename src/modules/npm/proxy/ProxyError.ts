/**
 * Thrown by proxy functions when the upstream API returns a non-OK response
 * or when the request times out.
 */
export class ProxyError extends Error {
  constructor(
    public readonly service: string,
    public readonly status: number | 'timeout' | 'network',
    message: string,
  ) {
    super(message)
    this.name = 'ProxyError'
  }
}
