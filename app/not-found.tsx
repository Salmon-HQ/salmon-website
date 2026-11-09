import type { Metadata } from 'next';
import PageShell from '@/components/legal/PageShell';
import { DOCS_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Page not found — Salmon Wallet', robots: { index: false } };

export default function NotFound() {
  return (
    <PageShell>
      <h1 className="mb-4 text-4xl font-semibold tracking-[-0.03em]">Page not found</h1>
      <p className="mb-8 text-[#10131c]/70">This address does not match a page on Salmon Wallet.</p>
      <a href="/" className="inline-block rounded-full bg-[#ff5c45] px-6 py-3 font-medium text-white">Return home</a>
      <nav aria-label="Other places to look" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[#10131c]/70">
        <a href={DOCS_URL} className="underline underline-offset-4">Docs</a>
        <a href="/sitemap.xml" className="underline underline-offset-4">Sitemap</a>
        <a href="/llms.txt" className="underline underline-offset-4">llms.txt</a>
      </nav>
    </PageShell>
  );
}
