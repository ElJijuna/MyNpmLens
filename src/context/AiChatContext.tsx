import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ChatMessage,
  clearStoredChat,
  loadChatMessages,
  saveChatMessages,
} from '@/lib/aiChatStorage';
import {
  buildContextualPrompt,
  createChromeAiSession,
  getChromeAiAvailability,
} from '@/lib/chromeAi';

interface AiChatContextValue {
  messages: ChatMessage[];
  isGenerating: boolean;
  status?: string;
  sendMessage: (question: string) => Promise<void>;
  stopGeneration: () => void;
  clearConversation: () => void;
}

const AiChatContext = createContext<AiChatContextValue | undefined>(undefined);
const MAX_SESSION_MESSAGES = 20;

export const AiChatProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>();
  const sessionRef = useRef<LanguageModel | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  const nextIdRef = useRef(Math.max(0, ...messages.map((message) => message.id)) + 1);

  useEffect(() => {
    messagesRef.current = messages;
    if (!isGenerating) {
      saveChatMessages(messages);
    }
  }, [isGenerating, messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      sessionRef.current?.destroy();
    },
    [],
  );

  const getSession = useCallback(
    async (signal: AbortSignal) => {
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

      const history = messagesRef.current
        .filter((message) => message.content.length > 0)
        .slice(-MAX_SESSION_MESSAGES);
      const session = await createChromeAiSession(
        (progress) => setStatus(t('aiChat.downloading', { progress })),
        signal,
        history,
      );
      sessionRef.current = session;
      return session;
    },
    [t],
  );

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmedQuestion = question.trim();
      if (!trimmedQuestion || isGenerating) {
        return;
      }

      const userMessage: ChatMessage = {
        id: nextIdRef.current++,
        role: 'user',
        content: trimmedQuestion,
      };
      const assistantId = nextIdRef.current++;
      setMessages((current) => [
        ...current,
        userMessage,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setIsGenerating(true);
      setStatus(t('aiChat.thinking'));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const session = await getSession(controller.signal);
        const reader = session
          .promptStreaming(buildContextualPrompt(trimmedQuestion), { signal: controller.signal })
          .getReader();
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
          const errorMessage = error instanceof Error ? error.message : t('aiChat.error');
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: errorMessage } : message,
            ),
          );
          setStatus(undefined);
        }
      } finally {
        abortRef.current = null;
        setIsGenerating(false);
      }
    },
    [getSession, isGenerating, t],
  );

  const stopGeneration = useCallback(() => abortRef.current?.abort(), []);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    sessionRef.current?.destroy();
    sessionRef.current = null;
    messagesRef.current = [];
    nextIdRef.current = 1;
    setMessages([]);
    setStatus(undefined);
    clearStoredChat();
  }, []);

  const value = useMemo(
    () => ({ messages, isGenerating, status, sendMessage, stopGeneration, clearConversation }),
    [clearConversation, isGenerating, messages, sendMessage, status, stopGeneration],
  );

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
};

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error('useAiChat must be used inside AiChatProvider');
  }
  return context;
}
