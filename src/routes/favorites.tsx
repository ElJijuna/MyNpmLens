import { createFileRoute } from '@tanstack/react-router'
import { FavoritesPage } from '@/pages/Favorites'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})
