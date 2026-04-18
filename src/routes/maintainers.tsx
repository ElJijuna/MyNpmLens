import { createFileRoute } from '@tanstack/react-router'
import { MaintainersPage } from '@/pages/Maintainers'

export const Route = createFileRoute('/maintainers')({
  component: MaintainersPage,
})
