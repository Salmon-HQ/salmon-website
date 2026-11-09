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
  '/developers': '/api',
  '/es/developers': '/api',
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

for (const path of ['/', '/contact', '/api', '/robots.txt', '/sitemap.xml']) {
  test(`${path} answers 200`, async () => {
    assert.equal((await fetch(BASE + path)).status, 200);
  });
}

const MARKDOWN = { accept: 'text/markdown' };

for (const path of ['/', '/seeker', '/api', '/contact', '/terms', '/es/privacy']) {
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

test('/openapi.json is the backend spec, ready for function calling', async () => {
  const res = await fetch(`${BASE}/openapi.json`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^application\/json/);
  const spec = await res.json();
  assert.match(spec.openapi, /^3\./);
  assert.equal(spec.servers[0].url, 'https://api.salmonwallet.io');
  const ids = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      assert.ok(op.operationId, `${method} ${path} has an operationId`);
      assert.ok(op.summary || op.description, `${method} ${path} is described`);
      for (const param of [...(item.parameters ?? []), ...(op.parameters ?? [])]) assert.ok(param.$ref || param.schema, `${method} ${path} ${param.name} is typed`);
      ids.push(op.operationId);
    }
  }
  assert.equal(new Set(ids).size, ids.length, 'operationIds are unique');
});

test('/openapi.yaml is served as YAML and matches the JSON', async () => {
  const res = await fetch(`${BASE}/openapi.yaml`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^application\/yaml/);
  const { parse } = await import('yaml');
  assert.deepEqual(parse(await res.text()), await (await fetch(`${BASE}/openapi.json`)).json());
});

test('/.well-known/api-catalog is an RFC 9727 linkset pointing at the spec', async () => {
  const res = await fetch(`${BASE}/.well-known/api-catalog`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"');
  const [entry] = (await res.json()).linkset;
  assert.equal(entry.anchor, 'https://api.salmonwallet.io/');
  assert.equal(entry['service-desc'][0].href, 'https://www.salmonwallet.io/openapi.json');
  const head = await fetch(`${BASE}/.well-known/api-catalog`, { method: 'HEAD' });
  assert.equal(head.headers.get('link'), '<https://www.salmonwallet.io/.well-known/api-catalog>; rel="api-catalog"');
});

test('/api names the product API and lists every operation of the spec', async () => {
  const html = await (await fetch(`${BASE}/api`)).text();
  assert.match(html, /<title>Salmon Wallet API[^<]*<\/title>/);
  assert.match(html, /<h1[^>]*>Salmon Wallet API<\/h1>/);
  const spec = await (await fetch(`${BASE}/openapi.json`)).json();
  for (const path of Object.keys(spec.paths)) assert.ok(html.includes(path.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)) || html.includes(path), path);
});

test('the home links the API, the GitHub org and the API catalog, and names its product terms in JSON-LD', async () => {
  const home = await (await fetch(`${BASE}/`)).text();
  for (const text of ['href="/api"', 'href="https://github.com/Salmon-HQ"', '<link rel="api-catalog" href="/.well-known/api-catalog">', '"keywords":"Solana wallet', '"knowsAbout"', '"@type":"WebAPI"']) assert.ok(home.includes(text), text);
});

test('/llms.txt says when to use Salmon and how to call its API', async () => {
  const body = await (await fetch(`${BASE}/llms.txt`)).text();
  for (const text of ['## When to use Salmon', '## API', 'https://api.salmonwallet.io', 'https://www.salmonwallet.io/openapi.json', 'GET /v1/networks']) assert.ok(body.includes(text), text);
});

test('the Organization JSON-LD has a contact point and a postal address', async () => {
  const home = await (await fetch(`${BASE}/`)).text();
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const org = graph.find((node) => node['@type'] === 'Organization');
  assert.equal(org.contactPoint.contactType, 'integrations and product enquiries');
  assert.ok(org.contactPoint.email);
  assert.deepEqual(org.address, { '@type': 'PostalAddress', addressLocality: 'Buenos Aires', addressCountry: 'AR' });
});

test('/api documents the rate limits and the versioning and deprecation policy, in HTML and Markdown', async () => {
  const html = await (await fetch(`${BASE}/api`)).text();
  for (const text of ['id="rate-limits"', 'Retry-After', 'id="versioning"', '180 days', 'Deprecation header (RFC 9745)', 'Sunset header (RFC 8594)']) assert.ok(html.includes(text), text);
  const md = await (await fetch(`${BASE}/api`, { headers: MARKDOWN })).text();
  for (const text of ['## Rate limits', '## Versioning and deprecation', 'too_many_requests']) assert.ok(md.includes(text), text);
  const llms = await (await fetch(`${BASE}/llms.txt`)).text();
  for (const text of ['/api#rate-limits', '/api#versioning', 'Sunset']) assert.ok(llms.includes(text), text);
});
