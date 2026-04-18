import { useState } from 'react'
import { useNavigate, useMatchRoute } from '@tanstack/react-router'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  Sidebar,
  SidebarSection,
  SidebarItem,
  ActionRow,
  Avatar,
  Button,
  Icon,
  Spinner,
  Text,
  useBreakpoint,
  Box,
  WrapBox,
} from '@gnome-ui/react'
import { GoHome, Star, Information, Settings, OpenMenu, Refresh } from '@gnome-ui/icons'
import { useAuth } from '@/modules/auth/AuthProvider'
import { useSidebar } from '@/context/SidebarContext'
import { version } from '../../../package.json'
import './index.css'

export function AppSidebar() {
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()
  const { user } = useAuth()
  const { closeSidebar, sidebarCollapsed, toggleCollapsed } = useSidebar()
  const { isNarrow } = useBreakpoint()

  function go(to: string) {
    void navigate({ to })
    closeSidebar()
  }

  function handleToggle() {
    if (isNarrow) {
      closeSidebar()
    } else {
      toggleCollapsed()
    }
  }

  const [checking, setChecking] = useState(false)
  const [upToDate, setUpToDate] = useState(false)
  const { needRefresh: [needRefresh] } = useRegisterSW()

  async function handleCheckUpdate() {
    setChecking(true)
    setUpToDate(false)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      await reg?.update()
      if (!needRefresh) {
        setUpToDate(true)
        setTimeout(() => setUpToDate(false), 3000)
      }
    } finally {
      setChecking(false)
    }
  }

  const updateLabel = checking ? 'Checking…' : upToDate ? 'Up to date!' : 'Check for updates'
  const isCollapsed = !isNarrow && sidebarCollapsed

  return (
    <Sidebar collapsed={isCollapsed}>
      <div className="sidebar-header" data-collapsed={isCollapsed}>
        <Button variant="flat" size="sm" onClick={handleToggle} aria-label="Toggle sidebar">
          <Icon icon={OpenMenu} />
        </Button>
        {(!sidebarCollapsed || isNarrow) && (
          <Text variant="caption-heading">Npm Lens</Text>
        )}
      </div>

      <SidebarSection>
        <SidebarItem
          label="Home"
          icon={GoHome}
          active={!!matchRoute({ to: '/', fuzzy: false })}
          onClick={() => go('/')}
        />
        <SidebarItem
          label="Maintainers"
          icon={Star}
          active={!!matchRoute({ to: '/maintainers', fuzzy: true })}
          onClick={() => go('/maintainers')}
        />
        <SidebarItem
          label="Settings"
          icon={Settings}
          active={!!matchRoute({ to: '/settings' })}
          onClick={() => go('/settings')}
        />
        <SidebarItem
          label="About"
          icon={Information}
          active={!!matchRoute({ to: '/about' })}
          onClick={() => go('/about')}
        />
      </SidebarSection>

      <div className="sidebar-footer" data-collapsed={isCollapsed}>
        {user && !isCollapsed && (
          <ActionRow
            title={user.displayName ?? user.email ?? 'Profile'}
            subtitle={user.email ?? undefined}
            leading={
              <Avatar
                src={user.photoURL ?? undefined}
                name={user.displayName ?? user.email ?? '?'}
                size="sm"
              />
            }
            interactive
            onClick={() => go('/profile')}
          />
        )}
        {user && isCollapsed && (
          <Button
            variant="flat"
            size="sm"
            onClick={() => go('/profile')}
          >
            <Avatar
              src={user.photoURL ?? undefined}
              name={user.displayName ?? user.email ?? '?'}
              size="sm"
            />
          </Button>
        )}
        <Button
          variant="flat"
          size="sm"
          disabled={checking}
          onClick={handleCheckUpdate}
          leadingIcon={isCollapsed ? undefined : checking ? <Spinner size="sm" /> : <Icon icon={Refresh} />}
          aria-label={isCollapsed ? updateLabel : undefined}
        >
          {isCollapsed ? (checking ? <Spinner size="sm" /> : <Icon icon={Refresh} />) : updateLabel}
        </Button>
        <Box align="center">
          <WrapBox justify="center" align="center">
            <Text variant="caption" color="dim">
              ©
            </Text>
            <Text variant="caption" color="dim">
              {new Date().getFullYear()}
            </Text>
            <Text variant="caption" color="dim">
              Npm
            </Text>
            <Text variant="caption" color="dim">
              Lens
            </Text>
          </WrapBox>
          <Text variant="caption" color="dim">
            v{version}
          </Text>
        </Box>
      </div>
    </Sidebar>
  )
}
