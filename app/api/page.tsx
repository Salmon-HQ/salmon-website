import type { Metadata } from 'next';
import PageShell from '@/components/legal/PageShell';
import { API_RATE_LIMITS, API_VERSIONING, apiGroups, apiVersion } from '@/lib/api-spec';
import { API_DOCS_URL, API_SOURCE_URL, API_URL, DOCS_URL, sharingMetadata } from '@/lib/site';

const TITLE = 'Salmon Wallet API: Docs, Endpoints and OpenAPI Spec';
const DESCRIPTION =
  'The Salmon Wallet API serves the Salmon apps: Solana and Bitcoin balances, activity, tokens, NFTs, market data and dApp metadata. Public, no API key, described in OpenAPI.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/api' },
  ...sharingMetadata(TITLE, DESCRIPTION, '/api'),
};

const link = 'underline underline-offset-4';
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

export default function ApiPage() {
  return (
    <PageShell>
      <article>
        <h1 className="mb-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Salmon Wallet API</h1>
        <p className="mb-10 text-lg text-[#10131c]/70">
          The HTTP API behind the Salmon wallet apps: network catalog, balances, activity, token search, NFTs, market
          data and dApp metadata for Solana, plus Bitcoin balances and activity.
        </p>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Access</h2>
          <ul className="list-disc space-y-2 pl-5 text-[#10131c]/80">
            <li>Base URL: <code>{API_URL}</code></li>
            <li>Public, with no API key. Browser requests are limited to Salmon&rsquo;s own origins (CORS), and <code>/v1</code> is rate limited per IP.</li>
            <li>Errors use one envelope: <code>{'{ "error": "snake_case_code", "error_description": "…" }'}</code>.</li>
            <li>Endpoints that move assets return unsigned transactions for the wallet to review and sign. The API never receives a recovery phrase or private key.</li>
          </ul>
        </section>

        <section id="rate-limits" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Rate limits</h2>
          <ul className="list-disc space-y-2 pl-5 text-[#10131c]/80">
            {API_RATE_LIMITS.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section id="versioning" className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Versioning and deprecation</h2>
          <ul className="list-disc space-y-2 pl-5 text-[#10131c]/80">
            {API_VERSIONING.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">OpenAPI spec</h2>
          <p className="text-[#10131c]/80">
            The full contract (version {apiVersion}): <a href="/openapi.json" className={link}>openapi.json</a> ·{' '}
            <a href="/openapi.yaml" className={link}>openapi.yaml</a>. Every operation has an <code>operationId</code>, typed
            parameters and response schemas, ready for code generators and LLM function calling.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Endpoints</h2>
          <div className="space-y-8">
            {apiGroups.map((group) => (
              <div key={group.name}>
                <h3 className="mb-1 text-lg font-semibold capitalize">{group.name.replace('-', ' ')}</h3>
                <p className="mb-3 text-sm text-[#10131c]/60">{group.description}</p>
                <ul className="space-y-2 text-[15px]">
                  {group.operations.map((op) => (
                    <li key={op.operationId} className="break-words">
                      <code className="font-semibold">{op.method}</code> <code>{op.path}</code>
                      <span className="block text-[#10131c]/70">{op.summary}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Guides and source</h2>
          <ul className="list-disc space-y-2 pl-5 text-[#10131c]/80">
            <li><a href={API_DOCS_URL} className={link} {...external}>API reference in the Salmon docs</a>: parameters, examples, errors and retries.</li>
            <li><a href={`${DOCS_URL}/developer-zone/08_wallet_adapter_system`} className={link} {...external}>API and dApp integration</a>: connecting dApps to the Salmon extension.</li>
            <li><a href={API_SOURCE_URL} className={link} {...external}>Salmon API on GitHub</a></li>
          </ul>
        </section>
      </article>
    </PageShell>
  );
}
