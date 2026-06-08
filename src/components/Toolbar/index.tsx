import { usePlatform } from '@gnome-ui/hooks';
import { Add, OpenMenu } from '@gnome-ui/icons';
import { Button, HeaderBar, Icon, PathBar } from '@gnome-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/context/SidebarContext';
import { usePathSegments } from '@/hooks/usePathSegments';

interface ToolbarProps {
  onAddClick?: () => void;
}

export const Toolbar = ({ onAddClick }: ToolbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGnomeWebView } = usePlatform();
  const { sidebarOpen, openSidebar, closeSidebar, sidebarOverlay } = useSidebar();
  const segments = usePathSegments();

  if (isGnomeWebView) {
    return null;
  }

  return (
    <div className="sticky-header">
      <HeaderBar
        flat
        title={<PathBar segments={segments} onNavigate={(path) => navigate({ to: path })} />}
        start={
          sidebarOverlay ? (
            <Button
              variant="flat"
              onClick={sidebarOpen ? closeSidebar : openSidebar}
              aria-label={t('toolbar.toggleSidebar')}
            >
              <Icon icon={OpenMenu} />
            </Button>
          ) : undefined
        }
        end={
          onAddClick ? (
            <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
              {t('toolbar.add')}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
};
