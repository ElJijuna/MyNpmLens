import { createFileRoute } from '@tanstack/react-router'
import { PackageDetailPage } from '@/pages/PackageDetail'

export const Route = createFileRoute('/package/$name')({
  component: PackageDetailPage,
})
