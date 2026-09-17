const MAX_PAGE_CONTEXT_LENGTH = 14_000;

const MODEL_OPTIONS: LanguageModelCreateCoreOptions = {
  expectedInputs: [{ type: 'text', languages: ['en', 'es'] }],
  expectedOutputs: [{ type: 'text', languages: ['en', 'es'] }],
};

export type ChromeAiAvailability = Availability | 'unsupported';

export async function getChromeAiAvailability(): Promise<ChromeAiAvailability> {
  if (!('LanguageModel' in globalThis)) {
    return 'unsupported';
  }

  return LanguageModel.availability(MODEL_OPTIONS);
}

export function createChromeAiSession(
  onDownloadProgress: (progress: number) => void,
  signal?: AbortSignal,
) {
  return LanguageModel.create({
    ...MODEL_OPTIONS,
    signal,
    initialPrompts: [
      {
        role: 'system',
        content:
          'You are the built-in assistant for My Npm Lens. Answer questions about the application and the current page using only the supplied page context and the conversation. Be concise, be honest when the context is insufficient, and reply in the language used by the user.',
      },
    ],
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (event) => {
        onDownloadProgress(Math.round(event.loaded * 100));
      });
    },
  });
}

export function getCurrentPageContext(): string {
  const root = document.querySelector<HTMLElement>('[data-ai-page-context]');
  const visibleText = root?.innerText.replace(/\n{3,}/g, '\n\n').trim() ?? '';
  const trimmedText = visibleText.slice(0, MAX_PAGE_CONTEXT_LENGTH);

  return [
    `Application: My Npm Lens`,
    `Page title: ${document.title}`,
    `URL: ${window.location.href}`,
    `Language: ${document.documentElement.lang || navigator.language}`,
    'Visible page content:',
    trimmedText || '(No visible page text was found.)',
  ].join('\n');
}

export function buildContextualPrompt(question: string): string {
  return `<current-page-context>\n${getCurrentPageContext()}\n</current-page-context>\n\nUser question: ${question}`;
}
