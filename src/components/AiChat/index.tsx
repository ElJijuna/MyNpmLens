import { ProcessStop, SendTo } from '@gnome-ui/icons';
import { Button, Icon, Spinner } from '@gnome-ui/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAiChat } from '@/context/AiChatContext';

export interface AiChatProps {
  autoFocus?: boolean;
}

export const AiChat = ({ autoFocus = false }: AiChatProps) => {
  const { t } = useTranslation();
  const { messages, isGenerating, status, sendMessage, stopGeneration } = useAiChat();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const latestContent = messages[messages.length - 1]?.content;

  useEffect(() => {
    void latestContent;
    void status;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [latestContent, status]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || isGenerating) {
      return;
    }

    setInput('');
    await sendMessage(question);
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat__messages" aria-live="polite" aria-busy={isGenerating}>
        {messages.length === 0 ? (
          <div className="ai-chat__welcome">
            <div className="ai-chat__mark" aria-hidden="true">
              AI
            </div>
            <h3>{t('aiChat.welcomeTitle')}</h3>
            <p>{t('aiChat.welcomeDescription')}</p>
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className="ai-chat__message"
              data-role={message.role}
              aria-label={t(`aiChat.${message.role}`)}
            >
              <span className="ai-chat__message-label">{t(`aiChat.${message.role}`)}</span>
              <p>{message.content || t('aiChat.thinking')}</p>
            </article>
          ))
        )}
        {status && (
          <div className="ai-chat__status" role="status">
            {isGenerating && <Spinner size="sm" />}
            <span>{status}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="ai-chat__composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="ai-chat-input">
          {t('aiChat.inputLabel')}
        </label>
        <textarea
          id="ai-chat-input"
          ref={inputRef}
          rows={3}
          value={input}
          placeholder={t('aiChat.placeholder')}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="ai-chat__composer-actions">
          <span>{t('aiChat.contextHint')}</span>
          {isGenerating ? (
            <Button type="button" variant="flat" onClick={stopGeneration}>
              <Icon icon={ProcessStop} />
              {t('aiChat.stop')}
            </Button>
          ) : (
            <Button type="submit" variant="suggested" disabled={!input.trim()}>
              <Icon icon={SendTo} />
              {t('aiChat.send')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
