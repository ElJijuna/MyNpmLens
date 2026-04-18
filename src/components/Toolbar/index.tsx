import { HeaderBar, Button, Icon, PathBar, useBreakpoint } from '@gnome-ui/react'
import { Add, OpenMenu } from '@gnome-ui/icons'
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
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar()
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
            <>
              <Button variant="flat" onClick={sidebarOpen ? closeSidebar : openSidebar} aria-label="Toggle sidebar">
                <Icon icon={OpenMenu} />
              </Button>
            </>
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
