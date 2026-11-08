import type { ReactNode } from 'react';

const FOOTER_LINKS = [
  ['X', 'https://x.com/salmonwallet'],
  ['Telegram', 'https://t.me/salmon_wallet'],
  ['Medium', 'https://medium.com/@salmonwallet'],
  ['GitHub', 'https://github.com/Salmon-HQ'],
  ['Terms', '/terms'],
  ['Privacy', '/privacy'],
  ['Contact', '/contact'],
] as const;

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#10131c]">
      <header className="mx-auto flex max-w-[70ch] px-6 py-8">
        <a href="/" aria-label="Salmon home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-orange.svg" alt="Salmon" className="h-8 w-auto" />
        </a>
      </header>
      <main className="mx-auto max-w-[70ch] px-6 pb-20 pt-8 text-[17px] leading-[1.7]">{children}</main>
      <footer className="mx-auto flex max-w-[70ch] flex-wrap gap-x-5 gap-y-2 border-t border-[#10131c]/10 px-6 py-8 text-sm text-[#10131c]/60">
        <span>© {new Date().getFullYear()} Salmon Wallet. All rights reserved.</span>
        {FOOTER_LINKS.map(([label, href]) => (
          <a key={href} href={href} className="hover:text-[#ff5c45]" {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}>
            {label}
          </a>
        ))}
      </footer>
    </div>
  );
}
