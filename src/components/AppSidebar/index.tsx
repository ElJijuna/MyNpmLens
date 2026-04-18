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
  Spinner,
  Text,
} from '@gnome-ui/react'
import { GoHome, Star, Information, Settings } from '@gnome-ui/icons'
import { useAuth } from '@/modules/auth/AuthProvider'
import { version } from '../../../package.json'
import './index.css'

export function AppSidebar() {
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()
  const { user } = useAuth()

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

  return (
    <Sidebar>
      <SidebarSection>
        <SidebarItem
          label="Home"
          icon={GoHome}
          active={!!matchRoute({ to: '/', fuzzy: false })}
          onClick={() => navigate({ to: '/' })}
        />
        <SidebarItem
          label="Maintainers"
          icon={Star}
          active={!!matchRoute({ to: '/maintainers', fuzzy: true })}
          onClick={() => navigate({ to: '/maintainers' })}
        />
        <SidebarItem
          label="About"
          icon={Information}
          active={!!matchRoute({ to: '/about' })}
          onClick={() => navigate({ to: '/about' })}
        />
        <SidebarItem
          label="Settings"
          icon={Settings}
          active={!!matchRoute({ to: '/settings' })}
          onClick={() => navigate({ to: '/settings' })}
        />
      </SidebarSection>

      <div className="sidebar-footer">
        {user ? (
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
            onClick={() => navigate({ to: '/profile' })}
          />
        ) : (
          <Text variant="caption" color="dim">
            © {new Date().getFullYear()} Npm Lens · v{version}
          </Text>
        )}
        <Button
          variant="flat"
          size="sm"
          disabled={checking}
          onClick={handleCheckUpdate}
        >
          {checking && <Spinner size="sm" />}
          {updateLabel}
        </Button>
      </div>
    </Sidebar>
  )
}
