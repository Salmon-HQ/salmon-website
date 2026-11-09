import type { Metadata } from 'next';
import { headers } from 'next/headers';
import PageShell from '@/components/legal/PageShell';
import { DOCS_URL, SITE_URL, STORE_URLS, isDappStoreDevice } from '@/lib/site';

const TITLE = 'Salmon on Solana Seeker: Get It from the Solana dApp Store';
const DESCRIPTION =
  'Install Salmon, the lightweight, self-custodial Solana wallet, on your Solana Seeker from the Solana dApp Store. Open this page on your Seeker or scan its code.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/seeker' },
  openGraph: { type: 'website', title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/seeker`, siteName: 'Salmon Wallet' },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

const OTHER_PLATFORMS = [
  ['Chrome extension', STORE_URLS.chrome],
  ['Android (Google Play)', STORE_URLS.android],
  ['iOS (App Store)', STORE_URLS.ios],
] as const;

const button = 'inline-flex items-center gap-3 rounded-full bg-[#ff5c45] px-6 py-3 font-medium text-white shadow-[0_8px_30px_0_rgba(255,92,69,.3)]';

// Seekers get the dApp Store button first; everyone else (crawlers included) gets the way to reach it from a Seeker.
// Nothing redirects: the page is the same indexable document, only the order of what it offers changes.
export default async function SeekerPage() {
  const onSeeker = isDappStoreDevice((await headers()).get('user-agent') ?? '');
  const openInStore = (
    <a href={STORE_URLS.dappStore} className={button}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/seeker.svg" alt="" aria-hidden="true" className="h-4 w-auto" />
      Open in Solana dApp Store
    </a>
  );

  return (
    <PageShell>
      <article>
        <h1 className="mb-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Salmon on Solana Seeker</h1>
        <p className="mb-10 text-lg text-[#10131c]/70">
          Salmon is a lightweight, self-custodial Solana wallet: keep the essentials and add Powerups only when you need
          them. On a Solana Seeker, you install it from the Solana dApp Store.
        </p>

        {onSeeker ? (
          <section className="mb-12">
            {openInStore}
            <p className="mt-4 text-[#10131c]/70">
              This opens the Salmon listing in the Solana dApp Store. Check that the app ID is <code>io.salmonwallet.app</code> before you install.
            </p>
          </section>
        ) : (
          <section className="mb-12" aria-labelledby="open-on-seeker">
            <h2 id="open-on-seeker" className="mb-4 text-2xl font-semibold">Open on your Seeker</h2>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/seeker-qr.svg"
                alt="QR code for www.salmonwallet.io/seeker"
                width={180}
                height={180}
                className="h-[180px] w-[180px] shrink-0 rounded-2xl border border-[#10131c]/10"
              />
              <ol className="list-decimal space-y-3 pl-5 text-[#10131c]/80">
                <li>Scan this code with your Seeker, or open <strong>salmonwallet.io/seeker</strong> in its browser.</li>
                <li>Tap <strong>Open in Solana dApp Store</strong>.</li>
                <li>Check that the app ID is <code>io.salmonwallet.app</code>, then install Salmon.</li>
              </ol>
            </div>
            <p className="mt-8 text-[#10131c]/70">
              Already on your Seeker?{' '}
              <a href={STORE_URLS.dappStore} className="font-medium text-[#ff5c45] underline underline-offset-4">Open in Solana dApp Store</a>
            </p>
          </section>
        )}

        <section aria-labelledby="other-platforms">
          <h2 id="other-platforms" className="mb-4 text-2xl font-semibold">Not on a Seeker?</h2>
          <ul className="space-y-2 text-[#10131c]/80">
            {OTHER_PLATFORMS.map(([label, href]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[#10131c]/70">
            Setup, recovery and security guides are in the{' '}
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Salmon docs</a>.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
