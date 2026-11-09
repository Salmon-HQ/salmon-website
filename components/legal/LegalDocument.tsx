import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPowerupsLegal } from '@/lib/legal-powerups.mjs';
import PageShell from './PageShell';

// The text comes verbatim from lib/legal-powerups-content.mjs (regenerated from the SOT by scripts/sync-powerups-legal.mjs).
// The parser below handles what it uses: ##/### headings, paragraphs, "- " lists, pipe tables.
type Block = { type: 'h2' | 'h3' | 'p'; text: string } | { type: 'list'; items: string[] } | { type: 'table'; head: string[]; rows: string[][] };

function parseBlocks(markdown: string) {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith('### ')) blocks.push({ type: 'h3', text: line.slice(4) });
    else if (line.startsWith('## ')) blocks.push({ type: 'h2', text: line.slice(3) });
    else if (line.startsWith('- ') || line.startsWith('|')) {
      const prefix = line[0];
      const run: string[] = [];
      while (i < lines.length && lines[i].startsWith(prefix)) run.push(lines[i++]);
      i--;
      if (prefix === '-') blocks.push({ type: 'list', items: run.map((item) => item.slice(2)) });
      else {
        const [head, , ...rows] = run.map((row) => row.slice(1, -1).split('|').map((cell) => cell.trim()));
        blocks.push({ type: 'table', head, rows });
      }
    } else blocks.push({ type: 'p', text: line });
  }
  return blocks;
}

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;

function inline(text: string) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = out.length;
    if (m[1] !== undefined) out.push(<strong key={key} className="font-semibold">{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={key}>{m[2]}</em>);
    else {
      const external = /^https?:/.test(m[4]);
      out.push(
        <a key={key} href={m[4]} className="text-[#ff5c45] underline underline-offset-2" {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
          {m[3]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cell = 'border border-[#10131c]/15 p-3 align-top';

export type LegalKind = 'terms' | 'privacy';
export const LEGAL_LOCALES = ['en', 'es', 'pt'] as const;
export type LegalLocale = (typeof LEGAL_LOCALES)[number];

const META: Record<LegalLocale, Record<LegalKind, { title: string; description: string }>> = {
  en: {
    terms: { title: 'Terms & Conditions — Salmon Wallet', description: 'Terms and conditions for using Salmon Wallet services.' },
    privacy: { title: 'Privacy Policy — Salmon Wallet', description: 'Privacy policy for Salmon Wallet — how we collect, use, and protect your data.' },
  },
  es: {
    terms: { title: 'Términos y Condiciones — Salmon Wallet', description: 'Términos y condiciones para el uso de los servicios de Salmon Wallet.' },
    privacy: { title: 'Política de Privacidad — Salmon Wallet', description: 'Política de privacidad de Salmon Wallet — cómo recopilamos, usamos y protegemos sus datos.' },
  },
  pt: {
    terms: { title: 'Termos e Condições — Salmon Wallet', description: 'Termos e condições para o uso dos serviços da Salmon Wallet.' },
    privacy: { title: 'Política de Privacidade — Salmon Wallet', description: 'Política de privacidade da Salmon Wallet — como coletamos, usamos e protegemos seus dados.' },
  },
};

const legalPath = (locale: LegalLocale, kind: LegalKind) => `${locale === 'en' ? '' : `/${locale}`}/${kind}`;

export function legalMetadata(kind: LegalKind, locale: LegalLocale = 'en'): Metadata {
  return {
    ...META[locale][kind],
    alternates: {
      canonical: legalPath(locale, kind),
      languages: Object.fromEntries(LEGAL_LOCALES.map((l) => [l, legalPath(l, kind)])),
    },
  };
}

export default function LegalDocument({ kind, locale = 'en' }: { kind: LegalKind; locale?: LegalLocale }) {
  const doc = getPowerupsLegal(locale, kind);
  return (
    <PageShell locale={locale}>
      <article lang={locale}>
        <h1 className="mb-6 text-4xl font-semibold tracking-[-0.03em]">{doc.title}</h1>
        <p className="mb-10 text-[#10131c]/70">
          <strong className="font-semibold text-[#10131c]">{doc.effectiveLabel}:</strong> {doc.effective}
        </p>
        <div className="text-[#10131c]/80">
          {parseBlocks(doc.markdown).map((block, key) => {
            if (block.type === 'h2') return <h2 key={key} className="mb-4 mt-10 text-xl font-semibold text-[#10131c]">{inline(block.text)}</h2>;
            if (block.type === 'h3') return <h3 key={key} className="mb-3 mt-6 text-lg font-semibold text-[#10131c]">{inline(block.text)}</h3>;
            if (block.type === 'list')
              return (
                <ul key={key} className="mb-4 list-disc space-y-2 pl-6">
                  {block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}
                </ul>
              );
            if (block.type === 'table')
              return (
                <div key={key} className="mb-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[15px]">
                    <thead>
                      <tr>{block.head.map((c, i) => <th key={i} className={`${cell} font-semibold text-[#10131c]`}>{inline(c)}</th>)}</tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r}>{row.map((c, i) => <td key={i} className={cell}>{inline(c)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            return <p key={key} className="mb-4">{inline(block.text)}</p>;
          })}
        </div>
      </article>
    </PageShell>
  );
}
