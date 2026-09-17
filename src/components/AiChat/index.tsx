import { ProcessStop, SendTo } from '@gnome-ui/icons';
import { Button, Icon, Spinner } from '@gnome-ui/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildContextualPrompt,
  createChromeAiSession,
  getChromeAiAvailability,
} from '@/lib/chromeAi';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatProps {
  autoFocus?: boolean;
}

export const AiChat = ({ autoFocus = false }: AiChatProps) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>();
  const sessionRef = useRef<LanguageModel | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextIdRef = useRef(1);
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

  useEffect(
    () => () => {
      abortRef.current?.abort();
      sessionRef.current?.destroy();
    },
    [],
  );

  async function getSession(signal: AbortSignal) {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    const availability = await getChromeAiAvailability();
    if (availability === 'unsupported' || availability === 'unavailable') {
      throw new Error(t('aiChat.unavailable'));
    }

    if (availability === 'downloadable' || availability === 'downloading') {
      setStatus(t('aiChat.preparing'));
    }

    const session = await createChromeAiSession((progress) => {
      setStatus(t('aiChat.downloading', { progress }));
    }, signal);
    sessionRef.current = session;
    return session;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || isGenerating) {
      return;
    }

    const userMessage: ChatMessage = { id: nextIdRef.current++, role: 'user', content: question };
    const assistantId = nextIdRef.current++;
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsGenerating(true);
    setStatus(t('aiChat.thinking'));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const session = await getSession(controller.signal);
      const stream = session.promptStreaming(buildContextualPrompt(question), {
        signal: controller.signal,
      });
      const reader = stream.getReader();
      let response = '';

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) {
          break;
        }
        response = chunk.startsWith(response) ? chunk : response + chunk;
        const nextResponse = response;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: nextResponse } : message,
          ),
        );
        setStatus(undefined);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus(t('aiChat.stopped'));
      } else {
        const message = error instanceof Error ? error.message : t('aiChat.error');
        setMessages((current) =>
          current.map((item) => (item.id === assistantId ? { ...item, content: message } : item)),
        );
        setStatus(undefined);
      }
    } finally {
      abortRef.current = null;
      setIsGenerating(false);
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();
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
