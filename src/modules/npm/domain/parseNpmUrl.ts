/**
 * Extracts a package name from an npm URL or a plain package name string.
 *
 * Accepted inputs:
 *   - https://www.npmjs.com/package/react
 *   - https://www.npmjs.com/package/@tanstack/react-query
 *   - https://npmjs.com/package/lodash
 *   - react                        (plain name, unscoped)
 *   - @tanstack/react-query        (plain name, scoped)
 *
 * Returns null if the input cannot be resolved to a valid package name.
 */
export function parseNpmUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Try to parse as URL first
  try {
    const url = new URL(trimmed);
    const isNpmHost = url.hostname === 'www.npmjs.com' || url.hostname === 'npmjs.com';

    if (!isNpmHost) {
      return null;
    }

    // pathname: /package/react  or  /package/@tanstack/react-query
    const match = url.pathname.match(/^\/package\/(@?[^/]+(?:\/[^/]+)?)/);
    if (!match) {
      return null;
    }

    return validatePackageName(decodeURIComponent(match[1]));
  } catch {
    // Not a URL — treat as a raw package name
    return validatePackageName(trimmed);
  }
}

/**
 * Validates that a string is a syntactically valid npm package name.
 * Returns the name if valid, null otherwise.
 */
function validatePackageName(name: string): string | null {
  // Scoped: @scope/name  or  unscoped: name
  const valid = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
  return valid ? name : null;
}
