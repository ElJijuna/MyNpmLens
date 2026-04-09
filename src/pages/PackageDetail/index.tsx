import { Toolbar } from '@/components/Toolbar';
import { Route } from '@/routes/package.$name';
import { PackageInfoSection } from './sections/PackageInfoSection';
import { DownloadsSection } from './sections/DownloadsSection';
import { BundleSizeSection } from './sections/BundleSizeSection';
import { GitHubSection } from './sections/GitHubSection';
import { VulnerabilitySection } from './sections/VulnerabilitySection';

export function PackageDetailPage() {
  const { name } = Route.useParams()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar showBack />

      <main className="page-content detail-sections">
        <PackageInfoSection name={name} />
        <DownloadsSection name={name} />
        <BundleSizeSection name={name} />
        <GitHubSection packageName={name} />
        <VulnerabilitySection packageName={name} />
      </main>
    </div>
  )
}
