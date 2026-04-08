/**
 * Download counts from the npm downloads API.
 */
export interface NpmDownloads {
  packageName: string
  weekly: number
  monthly: number
}
