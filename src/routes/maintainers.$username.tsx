import { createFileRoute } from '@tanstack/react-router'
import { MaintainerPage } from '@/pages/Maintainer'

export const Route = createFileRoute('/maintainers/$username')({
  component: MaintainerPage,
})
