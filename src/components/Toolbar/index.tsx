import { usePlatform } from '@gnome-ui/hooks';
import { Add, ChatMessageNew, OpenMenu } from '@gnome-ui/icons';
import { Button, HeaderBar, Icon, PathBar } from '@gnome-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/context/SidebarContext';
import { usePathSegments } from '@/hooks/usePathSegments';

interface ToolbarProps {
  onAddClick?: () => void;
  aiChatOpen?: boolean;
  onAiChatClick?: () => void;
}

export const Toolbar = ({ onAddClick, aiChatOpen = false, onAiChatClick }: ToolbarProps) => {
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
          <div className="toolbar-actions">
            {onAddClick && (
              <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
                {t('toolbar.add')}
              </Button>
            )}
            {onAiChatClick && (
              <Button
                type="button"
                variant="flat"
                aria-label={t('aiChat.open')}
                aria-expanded={aiChatOpen}
                aria-controls="ai-chat-drawer"
                onClick={onAiChatClick}
              >
                <Icon icon={ChatMessageNew} />
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};
