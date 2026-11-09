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

const MARKDOWN = { accept: 'text/markdown' };

for (const path of ['/', '/seeker', '/contact', '/terms', '/es/privacy']) {
  test(`${path} answers in Markdown when asked, and in HTML otherwise`, async () => {
    const md = await fetch(BASE + path, { headers: MARKDOWN });
    assert.equal(md.status, 200);
    assert.equal(md.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.match(md.headers.get('vary'), /\bAccept\b/);
    assert.match(await md.text(), /^# /);
    const html = await fetch(BASE + path, { headers: { accept: 'text/html,*/*;q=0.8' } });
    assert.match(html.headers.get('content-type'), /^text\/html/);
  });
}

test('an unknown page is a 404 in Markdown too, with links to recover', async () => {
  const res = await fetch(`${BASE}/nope`, { headers: MARKDOWN });
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  const body = await res.text();
  for (const link of ['https://www.salmonwallet.io/)', 'https://docs.salmonwallet.io', '/sitemap.xml', '/llms.txt']) assert.ok(body.includes(link), link);
  assert.equal((await fetch(`${BASE}/nope`)).status, 404);
});

test('/llms.txt points agents at the docs and the Seeker page', async () => {
  const res = await fetch(`${BASE}/llms.txt`);
  assert.equal(res.status, 200);
  const body = await res.text();
  for (const text of ['https://docs.salmonwallet.io/llms.txt', 'https://docs.salmonwallet.io/llms-full.txt', 'https://www.salmonwallet.io/seeker', 'https://github.com/Salmon-HQ', '## FAQ']) assert.ok(body.includes(text), text);
});

test('/seeker offers the dApp Store first on a Seeker and the QR code elsewhere', async () => {
  const seeker = await (await fetch(`${BASE}/seeker`, { headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 15; Seeker) Chrome/131.0 Mobile' } })).text();
  assert.ok(seeker.includes('href="solanadappstore://details?id=io.salmonwallet.app"'));
  assert.ok(!seeker.includes('seeker-qr.svg'));
  const desktop = await (await fetch(`${BASE}/seeker`)).text();
  assert.ok(desktop.includes('seeker-qr.svg'));
  assert.ok(desktop.includes('<link rel="canonical" href="https://www.salmonwallet.io/seeker"/>'));
});

test('the sitemap lists /seeker and the home links to it', async () => {
  assert.ok((await (await fetch(`${BASE}/sitemap.xml`)).text()).includes('<loc>https://www.salmonwallet.io/seeker</loc>'));
  const home = await (await fetch(`${BASE}/`)).text();
  assert.ok(home.includes('href="/seeker"'));
  assert.ok(!home.includes('href="solanadappstore:'));
});
