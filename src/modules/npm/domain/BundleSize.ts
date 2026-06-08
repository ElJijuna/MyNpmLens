/**
 * Bundle size metrics from Bundlephobia.
 */
export interface BundleSize {
  packageName: string;
  version: string;
  /** Minified size in bytes */
  size: number;
  /** Minified + gzipped size in bytes */
  gzip: number;
  /** Whether the package has side effects (affects tree-shaking) */
  hasSideEffects: boolean;
}
