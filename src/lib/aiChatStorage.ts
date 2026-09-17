export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface StoredChat {
  version: 1;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'mynpmlens:ai-chat:v1';
const MAX_STORED_MESSAGES = 60;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === 'number' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.length > 0
  );
}

export function loadChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const stored = JSON.parse(raw) as Partial<StoredChat>;
    if (stored.version !== 1 || !Array.isArray(stored.messages)) {
      return [];
    }

    return stored.messages.filter(isChatMessage).slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]) {
  const stored: StoredChat = {
    version: 1,
    messages: messages.filter((message) => message.content.length > 0).slice(-MAX_STORED_MESSAGES),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function clearStoredChat() {
  localStorage.removeItem(STORAGE_KEY);
}
