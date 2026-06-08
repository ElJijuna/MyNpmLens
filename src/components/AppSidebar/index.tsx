import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  Applications,
  GoHome,
  Information,
  OpenMenu,
  Refresh,
  Settings,
  Star,
} from '@gnome-ui/icons';
import {
  ActionRow,
  Avatar,
  Badge,
  Box,
  Button,
  Icon,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Spinner,
  Text,
  WrapBox,
} from '@gnome-ui/react';
import { useMatchRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useFavorites, useMaintainers } from '@/modules/npm/hooks';
import { version } from '../../../package.json';
import './index.css';

export const AppSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const { user } = useAuth();
  const { closeSidebar, sidebarOverlay, sidebarCollapsed, toggleCollapsed } = useSidebar();
  const { data: favorites = [] } = useFavorites();
  const { data: maintainers = [] } = useMaintainers();

  function go(to: string) {
    void navigate({ to });
    closeSidebar();
  }

  function handleToggle() {
    if (sidebarOverlay) {
      closeSidebar();
    } else {
      toggleCollapsed();
    }
  }

  const [checking, setChecking] = useState(false);
  const [upToDate, setUpToDate] = useState(false);
  const {
    needRefresh: [needRefresh],
  } = useRegisterSW();

  async function handleCheckUpdate() {
    setChecking(true);
    setUpToDate(false);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
      if (!needRefresh) {
        setUpToDate(true);
        setTimeout(() => setUpToDate(false), 3000);
      }
    } finally {
      setChecking(false);
    }
  }

  const updateLabel = checking
    ? t('sidebar.checking')
    : upToDate
      ? t('sidebar.upToDate')
      : t('sidebar.checkForUpdates');
  const isCollapsed = !sidebarOverlay && sidebarCollapsed;

  return (
    <Sidebar collapsed={isCollapsed}>
      <div className="sidebar-header" data-collapsed={isCollapsed}>
        <Button
          variant="flat"
          size="sm"
          onClick={handleToggle}
          aria-label={t('sidebar.toggleSidebar')}
        >
          <Icon icon={OpenMenu} />
        </Button>
        {(!sidebarCollapsed || sidebarOverlay) && (
          <Text variant="caption-heading">{t('sidebar.title')}</Text>
        )}
      </div>

      <SidebarSection>
        <SidebarItem
          label={t('sidebar.home')}
          icon={GoHome}
          active={!!matchRoute({ to: '/', fuzzy: false })}
          onClick={() => go('/')}
        />
        <SidebarItem
          label={t('sidebar.favorites')}
          icon={Applications}
          active={!!matchRoute({ to: '/favorites', fuzzy: false })}
          onClick={() => go('/favorites')}
          suffix={
            !isCollapsed && favorites.length > 0 ? (
              <Badge variant="neutral">{favorites.length}</Badge>
            ) : undefined
          }
        />
        <SidebarItem
          label={t('sidebar.maintainers')}
          icon={Star}
          active={!!matchRoute({ to: '/maintainers', fuzzy: true })}
          onClick={() => go('/maintainers')}
          suffix={
            !isCollapsed && maintainers.length > 0 ? (
              <Badge variant="neutral">{maintainers.length}</Badge>
            ) : undefined
          }
        />
        <SidebarItem
          label={t('sidebar.settings')}
          icon={Settings}
          active={!!matchRoute({ to: '/settings' })}
          onClick={() => go('/settings')}
        />
        <SidebarItem
          label={t('sidebar.about')}
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
          <Button variant="flat" size="sm" onClick={() => go('/profile')}>
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
          leadingIcon={
            isCollapsed ? undefined : checking ? <Spinner size="sm" /> : <Icon icon={Refresh} />
          }
          aria-label={isCollapsed ? updateLabel : undefined}
        >
          {isCollapsed ? checking ? <Spinner size="sm" /> : <Icon icon={Refresh} /> : updateLabel}
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
              {t('sidebar.title')}
            </Text>
          </WrapBox>
          <Text variant="caption" color="dim">
            v{version}
          </Text>
        </Box>
      </div>
    </Sidebar>
  );
};
