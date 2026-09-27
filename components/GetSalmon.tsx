'use client';

import { useTranslations } from 'next-intl';
import { LINKS } from '@/lib/constants';
import ScrollReveal from './ui/ScrollReveal';
import { ChromeIcon, AndroidIcon, IosIcon } from './ui/platform-icons';

function PlatformCard({
  title,
  href,
  icon,
  tint,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  tint: string;
}) {
  const card = (
    <div
      className="platform-card flex h-full min-h-52 flex-col items-center justify-center gap-5 rounded-2xl border p-8 text-center"
      style={{ '--tint': tint } as React.CSSProperties}
    >
      {icon}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
    </div>
  );

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block h-full">
      {card}
    </a>
  );
}

const cardDirections = ['right', 'left', 'right'] as const;

const GITHUB_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function GetSalmon() {
  const t = useTranslations('getSalmon');

  return (
    <section id="get-salmon" className="relative py-24 sm:py-32">
      <div className="relative mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('heading')}
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ScrollReveal direction={cardDirections[0]} delay={0} duration={1.1} className="h-full">
            <PlatformCard title={t('extensionChrome')} href={LINKS.chrome} tint="#4285F4" icon={<ChromeIcon size={48} />} />
          </ScrollReveal>
          <ScrollReveal direction={cardDirections[1]} delay={0.12} duration={1.1} className="h-full">
            <PlatformCard title={t('android')} href={LINKS.playStore} tint="#3DDC84" icon={<AndroidIcon size={48} />} />
          </ScrollReveal>
          <ScrollReveal direction={cardDirections[2]} delay={0.24} duration={1.1} className="h-full">
            <PlatformCard title={t('ios')} href={LINKS.appStore} tint="#A2AAAD" icon={<IosIcon size={48} />} />
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2} duration={1.1}>
          <div className="mt-20 text-center">
            <h3 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">{t('closing')}</h3>
            <p className="mx-auto mt-4 max-w-xl text-text-secondary">{t('build.description')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={LINKS.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-white/25 hover:bg-white/5">
                {GITHUB_ICON}
                {t('code.cta')} ↗
              </a>
              <a href={LINKS.contact} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-white/25 hover:bg-white/5">
                {t('build.cta')} ↗
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
