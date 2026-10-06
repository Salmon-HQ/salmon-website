import { createElement as h, Fragment } from 'react';

// Parses the subset of markdown the SOT legal texts use: ##/### headings, paragraphs, "- " lists, pipe tables.
export function parseBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith('### ')) blocks.push({ type: 'h3', text: line.slice(4) });
    else if (line.startsWith('## ')) blocks.push({ type: 'h2', text: line.slice(3) });
    else if (line.startsWith('- ') || line.startsWith('|')) {
      const prefix = line[0];
      const run = [];
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

function inline(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = out.length;
    if (m[1] !== undefined) out.push(h('strong', { key, className: 'text-text-primary' }, m[1]));
    else if (m[2] !== undefined) out.push(h('em', { key }, m[2]));
    else {
      const external = /^https?:/.test(m[4]);
      out.push(
        h('a', { key, href: m[4], className: 'text-accent underline', ...(external && { target: '_blank', rel: 'noopener noreferrer' }) }, m[3])
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderLegalMarkdown(markdown) {
  return h(
    Fragment,
    null,
    parseBlocks(markdown).map((block, key) => {
      if (block.type === 'h2') return h('h2', { key, className: 'text-xl font-semibold text-text-primary mt-10 mb-4' }, inline(block.text));
      if (block.type === 'h3') return h('h3', { key, className: 'text-lg font-semibold text-text-primary mt-6 mb-3' }, inline(block.text));
      if (block.type === 'list')
        return h('ul', { key, className: 'list-disc pl-6 space-y-2 mb-4' }, block.items.map((item, i) => h('li', { key: i }, inline(item))));
      if (block.type === 'table')
        return h(
          'div',
          { key, className: 'overflow-x-auto mb-4' },
          h(
            'table',
            { className: 'w-full border-collapse text-left' },
            h('thead', null, h('tr', null, block.head.map((cell, i) => h('th', { key: i, className: 'border border-border-subtle p-3 font-semibold text-text-primary align-top' }, inline(cell))))),
            h('tbody', null, block.rows.map((row, r) => h('tr', { key: r }, row.map((cell, i) => h('td', { key: i, className: 'border border-border-subtle p-3 align-top' }, inline(cell))))))
          )
        );
      return h('p', { key, className: 'mb-4' }, inline(block.text));
    })
  );
}
