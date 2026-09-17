import i18n from '@/lib/i18n';

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

const LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD = 0.4;

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

import type { ChatMessage } from '@/lib/aiChatStorage';

export function createChromeAiSession(
  onDownloadProgress: (progress: number) => void,
  signal?: AbortSignal,
  history: ChatMessage[] = [],
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
      ...history.map(({ role, content }) => ({ role, content })),
    ],
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (event) => {
        onDownloadProgress(Math.round(event.loaded * 100));
      });
    },
  });
}

let summarizerPromise: Promise<Summarizer> | null = null;

async function getSummarizer(): Promise<Summarizer | null> {
  if (!('Summarizer' in globalThis)) {
    return null;
  }

  summarizerPromise ??= (async () => {
    const availability = await Summarizer.availability();
    if (availability !== 'available') {
      throw new Error('Summarizer not ready');
    }
    return Summarizer.create({
      type: 'key-points',
      format: 'plain-text',
      length: 'long',
      sharedContext:
        'Visible content of a page in the My Npm Lens app, for an AI assistant answering user questions about it.',
    });
  })();

  try {
    return await summarizerPromise;
  } catch {
    summarizerPromise = null;
    return null;
  }
}

async function condensePageContent(text: string): Promise<string> {
  if (text.length <= MAX_PAGE_CONTEXT_LENGTH) {
    return text;
  }

  const summarizer = await getSummarizer();
  if (summarizer) {
    try {
      return await summarizer.summarize(text);
    } catch {
      // Fall through to plain truncation below.
    }
  }

  return text.slice(0, MAX_PAGE_CONTEXT_LENGTH);
}

export async function getCurrentPageContext(): Promise<string> {
  const root = document.querySelector<HTMLElement>('[data-ai-page-context]');
  const visibleText = (root?.innerText ?? root?.textContent ?? '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const content = await condensePageContent(visibleText);

  return [
    `Application: My Npm Lens`,
    `Page title: ${document.title}`,
    `URL: ${window.location.href}`,
    `Language: ${i18n.language || navigator.language}`,
    'Visible page content:',
    content || '(No visible page text was found.)',
  ].join('\n');
}

export type ResponseLanguage = 'en' | 'es';

let languageDetectorPromise: Promise<LanguageDetector> | null = null;

async function getLanguageDetector(): Promise<LanguageDetector | null> {
  if (!('LanguageDetector' in globalThis)) {
    return null;
  }

  languageDetectorPromise ??= (async () => {
    const availability = await LanguageDetector.availability();
    if (availability !== 'available') {
      throw new Error('LanguageDetector not ready');
    }
    return LanguageDetector.create();
  })();

  try {
    return await languageDetectorPromise;
  } catch {
    languageDetectorPromise = null;
    return null;
  }
}

function detectResponseLanguageHeuristic(question: string): ResponseLanguage {
  const normalized = question.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

  const pageLanguage = i18n.language || navigator.language;
  return pageLanguage.toLocaleLowerCase().startsWith('es') ? 'es' : 'en';
}

export async function detectResponseLanguage(question: string): Promise<ResponseLanguage> {
  const detector = await getLanguageDetector();
  if (detector) {
    try {
      const [best] = await detector.detect(question);
      if (
        best?.detectedLanguage &&
        (best.confidence ?? 0) >= LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD
      ) {
        return best.detectedLanguage.toLowerCase().startsWith('es') ? 'es' : 'en';
      }
    } catch {
      // Fall through to the heuristic below.
    }
  }

  return detectResponseLanguageHeuristic(question);
}

export async function buildContextualPrompt(question: string): Promise<string> {
  const [responseLanguage, pageContext] = await Promise.all([
    detectResponseLanguage(question),
    getCurrentPageContext(),
  ]);
  const languageName = responseLanguage === 'es' ? 'Spanish' : 'English';

  return [
    '<current-page-context>',
    pageContext,
    '</current-page-context>',
    '',
    `<user-question>${question}</user-question>`,
    `<response-language>${languageName}</response-language>`,
    `Mandatory: Respond only in ${languageName}. Do not follow the language of the page context.`,
  ].join('\n');
}
