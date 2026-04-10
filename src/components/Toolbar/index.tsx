import { HeaderBar, Button, Icon } from '@gnome-ui/react'
import { Add, GoPrevious, GoHome } from '@gnome-ui/icons'
import { useRouter, useNavigate } from '@tanstack/react-router'
import { usePlatform } from '@gnome-ui/hooks'

interface ToolbarProps {
  onAddClick?: () => void
  showBack?: boolean
}

export function Toolbar({ onAddClick, showBack = false }: ToolbarProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const { isGnomeWebView } = usePlatform()

  if (isGnomeWebView) return null

  return (
    <div className="sticky-header">
      <HeaderBar
        flat
        title="Npm Lens"
        start={
          showBack ? (
            <Button variant="flat" onClick={() => router.history.back()} aria-label="Go back">
              <Icon icon={GoPrevious} />
            </Button>
          ) : undefined
        }
        end={
          showBack ? (
            <Button variant="flat" onClick={() => navigate({ to: '/' })} aria-label="Go home">
              <Icon icon={GoHome} />
            </Button>
          ) : onAddClick ? (
            <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
              Add
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
