import { Toolbar } from '@/components/Toolbar'
import { Route } from '@/routes/package.$name'
import { PackageInfoSection } from './sections/PackageInfoSection'
import { DownloadsSection } from './sections/DownloadsSection'
import { BundleSizeSection } from './sections/BundleSizeSection'
import { GitHubSection } from './sections/GitHubSection'

export function PackageDetailPage() {
  const { name } = Route.useParams()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toolbar showBack />

      <main
        style={{
          flex: 1,
          padding: '1.5rem',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <PackageInfoSection name={name} />
        <DownloadsSection name={name} />
        <BundleSizeSection name={name} />
        <GitHubSection packageName={name} />
      </main>
    </div>
  )
}
