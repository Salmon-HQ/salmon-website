'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { LINKS } from '@/lib/constants';

interface FooterLink {
  label: string;
  href: string;
  external: boolean;
}

export default function Footer() {
  const t = useTranslations('footer');
  const tPlatform = useTranslations('getSalmon');

  const columns: { label: string; links: FooterLink[] }[] = [
    {
      label: t('columns.product'),
      links: [
        { label: tPlatform('extension'), href: LINKS.chrome, external: true },
        { label: tPlatform('android'), href: LINKS.playStore, external: true },
      ],
    },
    {
      label: t('columns.developers'),
      links: [
        { label: t('github'), href: LINKS.github, external: true },
        { label: t('developers'), href: '/developers', external: false },
        { label: t('brand'), href: '/brand', external: false },
        { label: t('apply'), href: LINKS.contact, external: true },
        { label: t('mediaKit'), href: LINKS.mediaKit, external: true },
      ],
    },
    {
      label: t('columns.community'),
      links: [
        { label: t('xTwitter'), href: LINKS.twitter, external: true },
        { label: t('telegram'), href: LINKS.telegram, external: true },
        { label: t('medium'), href: LINKS.medium, external: true },
      ],
    },
    {
      label: t('columns.legal'),
      links: [
        { label: t('terms'), href: '/terms', external: false },
        { label: t('privacy'), href: '/privacy', external: false },
        { label: t('about'), href: '/about', external: false },
        { label: t('contact'), href: '/contact', external: false },
      ],
    },
  ];

  const linkClass =
    'text-sm text-text-secondary transition-colors hover:text-text-primary';

  const renderLink = ({ label, href, external }: FooterLink) =>
    external ? (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {label}
      </a>
    ) : (
      <Link key={label} href={href} className={linkClass}>
        {label}
      </Link>
    );

  return (
    <footer className="relative overflow-hidden border-t border-border-default bg-bg-secondary/50">
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 flex flex-col items-center justify-center gap-5 border-b border-border-default/50 pb-12 sm:flex-row sm:gap-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            {t('supportedBy')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-6">
            <a
              href="https://lafamilia.so/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit La Familia"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/partners/la-familia.png"
                alt="La Familia"
                width={3210}
                height={357}
                className="h-7 w-auto max-w-[220px] object-contain"
              />
            </a>
            <a
              href="https://superteam.ar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Superteam Argentina"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/partners/superteam-argentina.svg"
                alt="Superteam Argentina"
                width={1000}
                height={170}
                className="h-8 w-auto max-w-[190px] object-contain"
              />
            </a>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Salmon Wallet"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <Image
                src="/images/app-title.png"
                alt="Salmon"
                width={90}
                height={22}
                className="h-4 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm text-text-tertiary">{t('description')}</p>
          </div>

          {columns.map(({ label, links }) => (
            <nav key={label} aria-label={label} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
              {links.map(renderLink)}
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-border-default/50 pt-6">
          <p className="text-sm text-text-tertiary">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
