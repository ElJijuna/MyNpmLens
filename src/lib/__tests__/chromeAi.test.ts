import { buildContextualPrompt, detectResponseLanguage } from '../chromeAi';

describe('Chrome AI prompt language', () => {
  it.each([
    ['¿Qué paquetes aparecen en esta página?', 'es'],
    ['Puedes explicar las descargas del paquete?', 'es'],
    ['Que mantenedores tiene este paquete?', 'es'],
    ['Which packages appear on this page?', 'en'],
    ['Explain the weekly downloads', 'en'],
  ] as const)('detects the response language for %s', async (question, expected) => {
    expect(await detectResponseLanguage(question)).toBe(expected);
  });

  it('adds an explicit Spanish-only instruction next to a Spanish question', async () => {
    document.body.innerHTML = '<main data-ai-page-context>Dashboard content in English</main>';

    const prompt = await buildContextualPrompt('¿Qué paquetes aparecen?');

    expect(prompt).toContain('<response-language>Spanish</response-language>');
    expect(prompt).toContain('Respond only in Spanish');
  });
});
