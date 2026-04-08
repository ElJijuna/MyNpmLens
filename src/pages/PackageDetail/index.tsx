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

      <main className="page-content detail-sections">
        <PackageInfoSection name={name} />
        <DownloadsSection name={name} />
        <BundleSizeSection name={name} />
        <GitHubSection packageName={name} />
      </main>
    </div>
  )
}
