import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/pages/Profile'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})
