// Checks the production build (`npm run build` first): the legal pages show the SOT text verbatim, the file the
// mobile app reads is served, and the previous site's addresses still land somewhere.
import { spawn } from 'node:child_process';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { getPowerupsLegal } from '../lib/legal-powerups.mjs';

const PORT = 3199;
const BASE = `http://localhost:${PORT}`;
let server;

before(async () => {
  server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${BASE}/robots.txt`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('next start did not come up; run `npm run build` first');
});

after(() => process.kill(-server.pid));

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const normalize = (s) => decode(s).replace(/\s+/g, ' ').trim();
const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

for (const locale of ['en', 'es', 'pt']) {
  for (const kind of ['terms', 'privacy']) {
    const path = `${locale === 'en' ? '' : `/${locale}`}/${kind}`;
    test(`${path} shows the SOT text verbatim`, async () => {
      const res = await fetch(BASE + path);
      assert.equal(res.status, 200);
      const html = await res.text();
      const text = normalize(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<\/?(a|strong|em|code)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' '));
      const doc = getPowerupsLegal(locale, kind);
      const pieces = [doc.title, doc.effectiveLabel, doc.effective];
      for (const line of doc.markdown.split('\n')) {
        if (!line.trim()) continue;
        if (line.startsWith('|')) pieces.push(...line.slice(1, -1).split('|'));
        else pieces.push(line.replace(/^#+ /, '').replace(/^- /, ''));
      }
      const missing = pieces.map((p) => normalize(plain(p))).filter((p) => p && !/^[-: |]+$/.test(p) && !text.includes(p));
      assert.deepEqual(missing, []);
    });
  }
}

test('the mobile app update file is served', async () => {
  const res = await fetch(`${BASE}/app/mobile-release.json`);
  assert.equal(res.status, 200);
  assert.equal(typeof (await res.json()), 'object');
});

const REDIRECTS = {
  '/about': '/',
  '/brand': '/',
  '/developers': '/',
  '/es': '/',
  '/pt': '/',
  '/en': '/',
  '/en/terms': '/terms',
  '/es/contact': '/contact',
  '/es/about': '/',
  '/powerups/terms': '/terms',
  '/es/powerups/privacy': '/es/privacy',
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  test(`${from} redirects to ${to}`, async () => {
    const res = await fetch(BASE + from, { redirect: 'manual' });
    assert.equal(res.status, 308);
    assert.equal(new URL(res.headers.get('location'), BASE).pathname, to);
  });
}

for (const path of ['/', '/contact', '/robots.txt', '/sitemap.xml']) {
  test(`${path} answers 200`, async () => {
    assert.equal((await fetch(BASE + path)).status, 200);
  });
}
