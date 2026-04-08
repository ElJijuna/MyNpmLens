export interface OsvVulnerability {
  id: string
  summary?: string
  details?: string
  aliases?: string[]
  modified?: string
  published?: string
  schema_version?: string
  severity?: { type: string; score: string }[]
  database_specific?: {
    severity?: string
    cwe_ids?: string[]
    github_reviewed?: boolean
    github_reviewed_at?: string
    nvd_published_at?: string
  }
  references?: { type: string; url: string }[]
  affected?: {
    package: { name: string; ecosystem: string; purl?: string }
    ranges?: {
      type: string
      events: ({ introduced: string } | { fixed: string } | { last_affected: string })[]
    }[]
    versions?: string[]
    database_specific?: { source?: string }
  }[]
}

interface OsvResponse {
  vulns?: OsvVulnerability[]
}

export async function fetchOsvVulnerabilities(
  packageName: string,
  packageVersion: string,
): Promise<OsvVulnerability[]> {
  const res = await fetch('https://api.osv.dev/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: { name: packageName, ecosystem: 'npm' },
      version: packageVersion,
    }),
  })

  if (!res.ok) {
    throw new Error(`OSV API responded with ${res.status}`)
  }

  const data: OsvResponse = await res.json()
  return data.vulns ?? []
}
