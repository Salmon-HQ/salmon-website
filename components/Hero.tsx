'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LINKS } from '@/lib/constants';
import GradientButton from './ui/GradientButton';
import PhoneFrame from './hero/PhoneFrame';
import HomeScreenMock from './hero/HomeScreenMock';
import { ChromeIcon, AndroidIcon, IosIcon } from './ui/platform-icons';

export default function Hero() {
  const t = useTranslations('hero');
  const tPlatform = useTranslations('getSalmon');
  const prefersReducedMotion = useReducedMotion();

  const platforms = [
    { key: 'extension', label: tPlatform('extension'), href: LINKS.chrome, icon: <ChromeIcon size={28} />, tint: '#4285F4' },
    { key: 'android', label: tPlatform('android'), href: LINKS.playStore, icon: <AndroidIcon size={28} />, tint: '#3DDC84' },
    { key: 'ios', label: tPlatform('ios'), href: LINKS.appStore, icon: <IosIcon size={28} />, tint: '#A2AAAD' },
  ] as const;

  // Mount guard: avoid FOIC — content visible during SSR, animations after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stagger: Variants = {
    animate: { transition: { staggerChildren: 0.14 } },
  };

  const fadeBlurUp: Variants =
    prefersReducedMotion || !mounted
      ? { initial: {}, animate: {} }
      : {
          initial: { opacity: 0, y: 32, filter: 'blur(10px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        };

  const transition = { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-14 sm:pt-16 lg:min-h-[100dvh]">
      {/* Subtle gradient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.06] blur-[120px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-12">
        {/* Text column */}
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left min-[1024px]:max-[1160px]:pl-8"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={fadeBlurUp}
            transition={transition}
            className="mb-5 whitespace-pre-line text-[clamp(2rem,3.4vw+0.6rem,4rem)] font-bold leading-[1.05] tracking-tight"
          >
            {t('heading')}
          </motion.h1>

          <motion.p
            variants={fadeBlurUp}
            transition={transition}
            className="mb-3 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            {t('subheading')}
          </motion.p>

          <motion.p
            variants={fadeBlurUp}
            transition={transition}
            className="mb-7 text-sm text-text-tertiary"
          >
            {t('tagline')}
          </motion.p>

          {/* Where you can get Salmon today */}
          <motion.ul
            variants={fadeBlurUp}
            transition={transition}
            className="mb-7 flex items-start gap-4"
          >
            {platforms.map(({ key, label, href, icon, tint }) => {
              const tile = (
                <>
                  <span className="platform-tile flex h-16 w-16 items-center justify-center rounded-2xl border">
                    {icon}
                  </span>
                  <span className="text-xs font-medium text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
                    {label}
                  </span>
                </>
              );

              return (
                <li key={key} style={{ '--tint': tint } as React.CSSProperties}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    {tile}
                  </a>
                </li>
              );
            })}
          </motion.ul>

          {/* Builder-first util links: code + socials */}
          <motion.div
            variants={fadeBlurUp}
            transition={transition}
            className="flex items-center gap-6 text-text-secondary"
          >
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-text-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href={LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="transition-colors hover:text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="transition-colors hover:text-text-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <div className="border-l border-border-subtle pl-6">
              <GradientButton href={LINKS.contact} variant="secondary" className="px-5 py-2.5">
                {t('integrate')} ↗
              </GradientButton>
            </div>
          </motion.div>
        </motion.div>

        {/* Phone column */}
        <motion.div
          initial={prefersReducedMotion || !mounted ? undefined : { opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
          animate={prefersReducedMotion || !mounted ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          {/* iPhone 17 Pro Max proportions; the frame is the container the screen sizes itself against */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            role="img"
            aria-label={t('walletPreview')}
            className="relative aspect-[440/956] h-[min(46svh,380px)] w-auto max-w-full @container sm:h-[min(52svh,460px)] lg:h-[min(68dvh,620px)]"
          >
            <PhoneFrame>
              <HomeScreenMock />
            </PhoneFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
