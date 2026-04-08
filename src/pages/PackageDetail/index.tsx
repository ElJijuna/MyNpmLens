import { useParams } from '@tanstack/react-router'
import { Route } from '@/routes/package.$name'

export function PackageDetailPage() {
  const { name } = Route.useParams()
  return <div>Package Detail: {name} — Phase 6</div>
}
