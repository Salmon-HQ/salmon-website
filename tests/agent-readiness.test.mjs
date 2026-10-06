import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  markdownForRoute,
  markdownNotFound,
  acceptsJson,
  prefersMarkdown,
  routeDetails,
  withVary,
} from '../lib/agent-content.mjs';
import { clearRateLimits, consumeRateLimit, rateLimitHeaders } from '../lib/rate-limit.mjs';
import { structuredData } from '../lib/structured-data.mjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderLegalMarkdown } from '../lib/legal-markdown.mjs';
import { getPowerupsLegal } from '../lib/legal-powerups.mjs';
import { convertSotMarkdown } from '../scripts/sync-powerups-legal.mjs';

test('Accept negotiation selects markdown without overriding a preferred HTML type', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.9'), false);
  assert.equal(prefersMarkdown('text/html;q=0.5, text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown;q=0'), false);
});

test('JSON negotiation and cache variance are deterministic', () => {
  assert.equal(acceptsJson('*/*'), true);
  assert.equal(acceptsJson('application/json'), true);
  assert.equal(acceptsJson('text/plain'), false);
  assert.equal(withVary('Accept-Encoding', 'Accept'), 'Accept-Encoding, Accept');
  assert.equal(withVary('Accept, Accept-Encoding', 'accept'), 'Accept, Accept-Encoding');
});

test('localized public routes are recognized and unknown routes are rejected', () => {
  assert.deepEqual(routeDetails('/'), { locale: 'en', route: '/' });
  assert.deepEqual(routeDetails('/es/privacy'), { locale: 'es', route: '/privacy' });
  assert.deepEqual(routeDetails('/pt/terms'), { locale: 'pt', route: '/terms' });
  assert.deepEqual(routeDetails('/about'), { locale: 'en', route: '/about' });
  assert.deepEqual(routeDetails('/es/contact'), { locale: 'es', route: '/contact' });
  assert.deepEqual(routeDetails('/developers'), { locale: 'en', route: '/developers' });
  assert.deepEqual(routeDetails('/pt/brand'), { locale: 'pt', route: '/brand' });
  assert.equal(routeDetails('/missing-page'), null);
});

test('homepage markdown has a hierarchical outline and substantial raw content', () => {
  const markdown = markdownForRoute({ locale: 'en', route: '/' });
  assert.match(markdown, /^# Salmon Wallet/m);
  assert.match(markdown, /^## Integrations/m);
  assert.ok(markdown.length > 500);
  assert.match(markdown, /llms\.txt/);
});

test('legal documents keep the core facts in every locale', () => {
  for (const locale of ['en', 'es', 'pt']) {
    const terms = markdownForRoute({ locale, route: '/terms' });
    const privacy = markdownForRoute({ locale, route: '/privacy' });
    for (const required of ['GeekOcean Labs Ltd', 'Apple', 'Swap']) assert.match(terms, new RegExp(required));
    for (const required of ['GeekOcean Labs Ltd', 'mempool.space', 'Google Analytics']) assert.match(privacy, new RegExp(required));
    assert.doesNotMatch(`${terms}${privacy}`, /Blockdaemon|Helius/);
  }
});

test('markdown 404 gives agents recovery links', () => {
  const markdown = markdownNotFound('/missing-page');
  assert.match(markdown, /^# 404/m);
  assert.match(markdown, /sitemap\.xml/);
  assert.match(markdown, /llms\.txt/);
});

test('published OpenAPI document is OpenAPI 3.1 and describes its paths', () => {
  const spec = JSON.parse(readFileSync(new URL('../public/openapi.json', import.meta.url), 'utf8'));
  assert.equal(spec.openapi, '3.1.0');
  assert.equal(spec.servers[0].url, 'https://salmonwallet.io');
  const operation = spec.paths['/api/v1/discovery'].get;
  assert.ok(operation.responses['200']);
  assert.equal(operation.responses['406'].$ref, '#/components/responses/NotAcceptable');
  assert.equal(operation.responses['429'].$ref, '#/components/responses/TooManyRequests');
  assert.equal(operation.responses['500'].$ref, '#/components/responses/InternalError');
  assert.equal(spec.components.responses.NotAcceptable.content['application/problem+json'].schema.$ref, '#/components/schemas/Problem');
  assert.match(spec.info.description, /new URL major version/);
  assert.match(spec.info.description, /180 days/);
  for (const [status, response] of Object.entries(operation.responses)) {
    if (/^[45]/.test(status)) {
      const typed = response.$ref
        ? spec.components.responses[response.$ref.split('/').at(-1)].content['application/problem+json'].schema.$ref
        : response.content?.['application/problem+json']?.schema?.$ref;
      assert.equal(typed, '#/components/schemas/Problem');
    }
  }
});

test('rate limits expose RFC headers and reject requests beyond the quota', () => {
  clearRateLimits();
  let result;
  for (let request = 0; request <= 60; request += 1) result = consumeRateLimit('test-client', 1_000);
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
  const headers = rateLimitHeaders(result);
  assert.match(headers['RateLimit-Policy'], /q=60;w=60/);
  assert.match(headers.RateLimit, /r=0;t=/);
});

test('JSON-LD identifies the product and complete public contact information', () => {
  const graph = structuredData('en')['@graph'];
  const organization = graph.find((item) => item['@type'] === 'Organization');
  const application = graph.find((item) => item['@type'] === 'SoftwareApplication');
  assert.equal(organization.name, 'Salmon Wallet');
  assert.ok(organization.description);
  assert.equal(organization.contactPoint.email, 'integrations@salmonwallet.io');
  assert.equal(application.applicationCategory, 'FinanceApplication');
  assert.ok(application.downloadUrl.length >= 3);
});

test('trust and developer pages contain substantial, structured public copy', () => {
  const source = readFileSync(new URL('../lib/info-pages.ts', import.meta.url), 'utf8');
  for (const page of ['about', 'contact', 'developers']) {
    const start = source.indexOf(`${page}: {`);
    const end = source.indexOf('\n  },', start);
    assert.ok(end - start > 500, `${page} should contain at least 500 source characters`);
  }
});

test('llms.txt gives agents specific when-to-use and calling guidance', () => {
  const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  assert.match(llms, /^## When to use Salmon$/m);
  assert.match(llms, /GET https:\/\/salmonwallet\.io\/api\/v1\/discovery/);
  assert.match(llms, /Do not use Salmon's website or CLI to sign transactions/);
});

test('CLI exposes stable machine-readable links', () => {
  const cli = fileURLToPath(new URL('../packages/salmon-cli/bin/salmon.mjs', import.meta.url));
  const output = execFileSync(process.execPath, [cli, 'links', '--json'], { encoding: 'utf8' });
  const links = JSON.parse(output);
  assert.equal(links.openapi, 'https://salmonwallet.io/openapi.json');
  assert.equal(links.agentIndex, 'https://salmonwallet.io/llms.txt');
  assert.equal(links.discoveryApi, 'https://salmonwallet.io/api/v1/discovery');
  assert.equal(links.developerDocs, 'https://salmonwallet.io/developers');
  assert.match(links.source, /^https:\/\/github\.com\/Salmon-HQ\//);
});

const SOT_DIR = fileURLToPath(new URL('../../SOT/07-publishing/Website/', import.meta.url));
const hasSot = existsSync(SOT_DIR);
const POWERUPS = { terms: 'Salmon Terms And Conditions Powerups 1.4', privacy: 'Salmon Privacy Policy Powerups 1.4' };
const POWERUPS_SHAPE = { terms: { h2: 22, h3: 15, tables: 0 }, privacy: { h2: 16, h3: 16, tables: 2 } };

// Source of truth: the SOT file when the sibling repo is checked out, otherwise the generated copy.
function powerupsSource(locale, kind) {
  if (!hasSot) return getPowerupsLegal(locale, kind).markdown;
  return readFileSync(`${SOT_DIR}${POWERUPS[kind]} ${locale.toUpperCase()}.md`, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
}

const wikiHref = (target) => {
  const [, name, locale] = target.match(/^(.*) (EN|ES|PT)$/);
  const kind = Object.keys(POWERUPS).find((key) => POWERUPS[key] === name);
  return `${locale === 'EN' ? '' : `/${locale.toLowerCase()}`}/${kind}`;
};

// Independent of the renderer: strips markdown syntax line by line to get the expected visible text.
function expectedText(markdown) {
  return markdown
    .split('\n')
    .filter((line) => !/^\|( *-+ *\|)+$/.test(line))
    .map((line) =>
      line
        .replace(/^(###|##|-) /, '')
        .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replaceAll('**', '')
        .replace(/\*([^*]+)\*/g, '$1')
        .replaceAll('|', ' ')
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const htmlText = (html) =>
  html
    .replace(/<\/?(strong|em|a)\b[^>]*>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const count = (html, tag) => (html.match(new RegExp(`<${tag}[ >]`, 'g')) ?? []).length;

test('generated Power-ups content matches the SOT files', { skip: !hasSot && 'SOT repo not checked out' }, () => {
  for (const locale of ['en', 'es', 'pt']) {
    for (const kind of Object.keys(POWERUPS)) {
      const source = readFileSync(`${SOT_DIR}${POWERUPS[kind]} ${locale.toUpperCase()}.md`, 'utf8');
      const { title, markdown } = getPowerupsLegal(locale, kind);
      assert.deepEqual({ title, markdown }, convertSotMarkdown(source));
    }
  }
});

test('Power-ups legal pages render the SOT text verbatim', () => {
  for (const locale of ['en', 'es', 'pt']) {
    for (const kind of Object.keys(POWERUPS)) {
      const source = powerupsSource(locale, kind);
      const html = renderToStaticMarkup(renderLegalMarkdown(getPowerupsLegal(locale, kind).markdown));
      const text = htmlText(html);
      const label = `${locale} ${kind}`;

      assert.equal(text, expectedText(source), label);
      for (const leftover of ['**', '[[', '](', '|']) assert.ok(!text.includes(leftover), `${label}: leftover ${leftover}`);

      const lines = source.split('\n');
      assert.equal(count(html, 'h2'), POWERUPS_SHAPE[kind].h2, label);
      assert.equal(count(html, 'h3'), POWERUPS_SHAPE[kind].h3, label);
      assert.equal(count(html, 'table'), POWERUPS_SHAPE[kind].tables, label);
      assert.equal(count(html, 'li'), lines.filter((line) => line.startsWith('- ')).length, label);
      const cells = lines.filter((line) => line.startsWith('|') && !/^\|( *-+ *\|)+$/.test(line)).reduce((n, line) => n + line.split('|').length - 2, 0);
      assert.equal(count(html, 'td') + count(html, 'th'), cells, label);

      const expectedHrefs = [...source.matchAll(/\[\[([^\]|]+)\|[^\]]+\]\]|\[[^\]]+\]\(([^)]+)\)/g)].map((m) => (m[1] ? wikiHref(m[1]) : m[2]));
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
      assert.deepEqual(hrefs, expectedHrefs, label);
      const crossLink = `${locale === 'en' ? '' : `/${locale}`}/${kind === 'terms' ? 'privacy' : 'terms'}`;
      assert.ok(hrefs.includes(crossLink), `${label}: links to ${crossLink}`);
    }
  }
});

test('legal routes serve the Power-ups texts to agents', () => {
  for (const locale of ['en', 'es', 'pt']) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    for (const kind of Object.keys(POWERUPS)) {
      const route = `/${kind}`;
      assert.deepEqual(routeDetails(`${prefix}${route}`), { locale, route });
      const markdown = markdownForRoute({ locale, route });
      const doc = getPowerupsLegal(locale, kind);
      assert.ok(markdown.startsWith(`# ${doc.title}\n\n**${doc.effectiveLabel}:** ${doc.effective}\n\n${doc.markdown}`));
    }
  }
  assert.equal(getPowerupsLegal('es', 'terms').effective, '6 de octubre de 2026');
  const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  assert.doesNotMatch(llms, /powerups\//);
  assert.doesNotMatch(readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8'), /powerups/);
  assert.match(readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8'), /source: '\/powerups\/:kind\(terms\|privacy\)', destination: '\/:kind'/);
});
