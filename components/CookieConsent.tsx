'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/i18n/navigation';

const STORAGE_KEY = 'salmon-analytics-consent';
const GA_MEASUREMENT_ID = 'G-8W36W1WMX8';

type Consent = 'granted' | 'denied' | 'unset';

function readConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    // Private browsing or blocked storage: ask again rather than assume consent.
    return 'unset';
  }
}

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const prefersReducedMotion = useReducedMotion();
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  const decide = (value: Exclude<Consent, 'unset'>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Storage unavailable: honour the choice for this session only.
    }
    setConsent(value);
  };

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      <AnimatePresence>
        {consent === 'unset' && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6 sm:pb-6"
            role="dialog"
            aria-live="polite"
            aria-label={t('label')}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border border-border-subtle bg-bg-secondary/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:p-6">
              <p className="flex-1 text-sm leading-relaxed text-text-secondary">
                {t('message')}{' '}
                <Link href="/privacy" className="text-accent transition-colors hover:text-accent/80">
                  {t('policy')}
                </Link>
              </p>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => decide('denied')}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-white/25 hover:bg-white/5"
                >
                  {t('decline')}
                </button>
                <button
                  type="button"
                  onClick={() => decide('granted')}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-end px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,92,69,0.3)]"
                >
                  {t('accept')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
