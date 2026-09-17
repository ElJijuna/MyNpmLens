const MAX_PAGE_CONTEXT_LENGTH = 14_000;
const SPANISH_MARKERS = new Set([
  'aparece',
  'aparecen',
  'aplicacion',
  'como',
  'cual',
  'cuales',
  'descargas',
  'donde',
  'esta',
  'este',
  'explica',
  'explicar',
  'hay',
  'mantenedores',
  'pagina',
  'paquete',
  'paquetes',
  'para',
  'porque',
  'puede',
  'puedes',
  'que',
  'tiene',
]);
const ENGLISH_MARKERS = new Set([
  'appear',
  'appears',
  'application',
  'downloads',
  'explain',
  'how',
  'maintainers',
  'package',
  'packages',
  'page',
  'the',
  'this',
  'what',
  'which',
  'why',
]);

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
          'You are the built-in assistant for My Npm Lens. Answer questions about the application and the current page using only the supplied page context and the conversation. Be concise and be honest when the context is insufficient. Every user turn includes a mandatory response-language instruction; always write the entire answer in that language, even when the page context uses another language.',
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
  const visibleText = (root?.innerText ?? root?.textContent ?? '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

export type ResponseLanguage = 'en' | 'es';

export function detectResponseLanguage(question: string): ResponseLanguage {
  const normalized = question.toLocaleLowerCase().normalize('NFD');
  const words = normalized.match(/[a-z]+/g) ?? [];
  let spanishScore = /[¿¡ñáéíóúü]/i.test(question) ? 3 : 0;
  let englishScore = 0;

  for (const word of words) {
    spanishScore += SPANISH_MARKERS.has(word) ? 1 : 0;
    englishScore += ENGLISH_MARKERS.has(word) ? 1 : 0;
  }

  if (spanishScore !== englishScore) {
    return spanishScore > englishScore ? 'es' : 'en';
  }

  const pageLanguage = document.documentElement.lang || navigator.language;
  return pageLanguage.toLocaleLowerCase().startsWith('es') ? 'es' : 'en';
}

export function buildContextualPrompt(question: string): string {
  const responseLanguage = detectResponseLanguage(question);
  const languageName = responseLanguage === 'es' ? 'Spanish' : 'English';

  return [
    '<current-page-context>',
    getCurrentPageContext(),
    '</current-page-context>',
    '',
    `<user-question>${question}</user-question>`,
    `<response-language>${languageName}</response-language>`,
    `Mandatory: Respond only in ${languageName}. Do not follow the language of the page context.`,
  ].join('\n');
}
