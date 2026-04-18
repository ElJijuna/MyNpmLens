import { HeaderBar, Button, Icon, PathBar, useBreakpoint } from '@gnome-ui/react'
import { Add, ViewSidebar } from '@gnome-ui/icons'
import { useNavigate } from '@tanstack/react-router'
import { usePlatform } from '@gnome-ui/hooks'
import { useSidebar } from '@/context/SidebarContext'
import { usePathSegments } from '@/hooks/usePathSegments'

interface ToolbarProps {
  onAddClick?: () => void
}

export function Toolbar({ onAddClick }: ToolbarProps) {
  const navigate = useNavigate()
  const { isGnomeWebView } = usePlatform()
  const { openSidebar } = useSidebar()
  const { isNarrow } = useBreakpoint()
  const segments = usePathSegments()

  if (isGnomeWebView) return null

  return (
    <div className="sticky-header">
      <HeaderBar
        flat
        title={
          <PathBar
            segments={segments}
            onNavigate={(path) => navigate({ to: path })}
          />
        }
        start={
          isNarrow ? (
            <Button variant="flat" onClick={openSidebar} aria-label="Open sidebar">
              <Icon icon={ViewSidebar} />
            </Button>
          ) : undefined
        }
        end={
          onAddClick ? (
            <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
              Add
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
