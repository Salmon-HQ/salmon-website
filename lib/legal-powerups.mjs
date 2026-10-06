import { powerupsLegalContent } from './legal-powerups-content.mjs';

const EFFECTIVE = {
  en: ['Effective date', 'October 6, 2026'],
  es: ['Entrada en vigor', '6 de octubre de 2026'],
  pt: ['Data de entrada em vigor', '6 de outubro de 2026'],
};

export function getPowerupsLegal(locale, kind) {
  const doc = (powerupsLegalContent[locale] ?? powerupsLegalContent.en)[kind];
  const [effectiveLabel, effective] = EFFECTIVE[locale] ?? EFFECTIVE.en;
  const intro = doc.markdown.split('\n')[0];
  return { ...doc, intro, effectiveLabel, effective };
}

export function powerupsLegalToMarkdown(locale, kind) {
  const doc = getPowerupsLegal(locale, kind);
  return `# ${doc.title}\n\n**${doc.effectiveLabel}:** ${doc.effective}\n\n${doc.markdown}\n`;
}
