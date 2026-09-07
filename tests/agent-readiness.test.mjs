import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
import { getLegalDocument, legalDocumentToMarkdown } from '../lib/legal-content.mjs';

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

test('legal documents are complete and structurally aligned in every locale', () => {
  for (const locale of ['en', 'es', 'pt']) {
    const terms = getLegalDocument(locale, 'terms');
    const privacy = getLegalDocument(locale, 'privacy');
    assert.equal(terms.sections.length, 22);
    assert.equal(privacy.sections.length, 14);

    const termsMarkdown = legalDocumentToMarkdown(terms);
    const privacyMarkdown = legalDocumentToMarkdown(privacy);
    for (const required of ['GeekOcean Labs Ltd', 'Apple App Store', 'USD 100']) {
      assert.match(termsMarkdown, new RegExp(required));
    }
    for (const required of ['GeekOcean Labs Ltd', 'Blockdaemon', 'CloudWatch', 'Google Analytics 4', '30']) {
      assert.match(privacyMarkdown, new RegExp(required));
    }
  }
});

test('legal markdown routes expose the full localized documents', () => {
  const english = markdownForRoute({ locale: 'en', route: '/privacy' });
  const spanish = markdownForRoute({ locale: 'es', route: '/terms' });
  const portuguese = markdownForRoute({ locale: 'pt', route: '/privacy' });
  assert.match(english, /^# Privacy Policy/m);
  assert.match(spanish, /^# Términos y Condiciones/m);
  assert.match(portuguese, /^# Política de Privacidade/m);
  assert.ok(english.length > 8_000);
  assert.ok(spanish.length > 8_000);
  assert.ok(portuguese.length > 8_000);
  assert.doesNotMatch(english, /available in the HTML representation/);
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
