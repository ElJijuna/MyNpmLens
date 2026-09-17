import { Close, Delete } from '@gnome-ui/icons';
import { Button, Icon } from '@gnome-ui/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AiChat } from '@/components/AiChat';
import { useAiChat } from '@/context/AiChatContext';

export interface AiChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const AiChatDrawer = ({ open, onClose }: AiChatDrawerProps) => {
  const { t } = useTranslation();
  const { messages, clearConversation } = useAiChat();
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) {
          return;
        }

        const [first] = focusable;
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="ai-drawer-layer">
      <button
        type="button"
        className="ai-drawer__backdrop"
        aria-label={t('aiChat.close')}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        id="ai-chat-drawer"
        className="ai-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-chat-title"
      >
        <header className="ai-drawer__header">
          <div>
            <h2 id="ai-chat-title">{t('aiChat.title')}</h2>
            <p>{t('aiChat.subtitle')}</p>
          </div>
          <div className="ai-drawer__actions">
            {messages.length > 0 && (
              <Button
                type="button"
                variant="flat"
                aria-label={t('aiChat.newConversation')}
                onClick={clearConversation}
              >
                <Icon icon={Delete} />
              </Button>
            )}
            <Button type="button" variant="flat" aria-label={t('aiChat.close')} onClick={onClose}>
              <Icon icon={Close} />
            </Button>
          </div>
        </header>
        <AiChat autoFocus />
      </aside>
    </div>
  );
};
