import Script from 'next/script';
import type { ReactNode } from 'react';
import { consentCss, consentHtml, consentScript, type ConsentLocale } from '@/components/consent/consent';
import { downloadsCss, footerCss, footerHtml } from '@/components/footer/site-footer';

export default function PageShell({ children, locale = 'en' }: { children: ReactNode; locale?: ConsentLocale }) {
  return (
    <div className="min-h-screen bg-white text-[#10131c]">
      <header className="mx-auto flex max-w-[70ch] px-6 py-8">
        <a href="/" aria-label="Salmon home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-orange.svg" alt="Salmon" className="h-8 w-auto" />
        </a>
      </header>
      <main className="mx-auto max-w-[70ch] px-6 pb-20 pt-8 text-[17px] leading-[1.7]">{children}</main>
      <style dangerouslySetInnerHTML={{ __html: downloadsCss + footerCss + consentCss }} />
      <footer dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <div dangerouslySetInnerHTML={{ __html: consentHtml(locale) }} />
      <Script id="salmon-consent-script" strategy="afterInteractive">{consentScript}</Script>
    </div>
  );
}
