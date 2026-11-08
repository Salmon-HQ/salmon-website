import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import content from './content.json';
import PageShell from './PageShell';

// content.json is generated from the old site (salmon-website lib/legal-powerups.mjs, English) and must stay verbatim.
// The parser below is a port of salmon-website lib/legal-markdown.mjs: ##/### headings, paragraphs, "- " lists, pipe tables.
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

export function legalMetadata(kind: keyof typeof content): Metadata {
  return content[kind].metadata;
}

export default function LegalDocument({ kind }: { kind: keyof typeof content }) {
  const doc = content[kind];
  return (
    <PageShell>
      <article>
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
