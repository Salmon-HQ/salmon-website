export type PowerupsLegalDoc = { title: string; markdown: string; intro: string; effectiveLabel: string; effective: string };
export function getPowerupsLegal(locale: 'en' | 'es' | 'pt', kind: 'terms' | 'privacy'): PowerupsLegalDoc;
export function powerupsLegalToMarkdown(locale: 'en' | 'es' | 'pt', kind: 'terms' | 'privacy'): string;
