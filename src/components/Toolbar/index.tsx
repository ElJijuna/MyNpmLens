import { HeaderBar, Button, Icon } from '@gnome-ui/react'
import { Add, GoPrevious } from '@gnome-ui/icons'
import { useRouter } from '@tanstack/react-router'

interface ToolbarProps {
  onAddClick?: () => void
  showBack?: boolean
}

export function Toolbar({ onAddClick, showBack = false }: ToolbarProps) {
  const router = useRouter()

  return (
    <div className="sticky-header">
      <HeaderBar
        flat
        title="My Npm Lens"
        start={
          showBack ? (
            <Button variant="flat" onClick={() => router.history.back()} aria-label="Go back">
              <Icon icon={GoPrevious} />
            </Button>
          ) : undefined
        }
        end={
          !showBack && onAddClick ? (
            <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
              Add
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
