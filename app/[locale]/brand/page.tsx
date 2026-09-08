import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { LINKS } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

const colors = [
  { name: 'Salmon', value: '#FF5C45', className: 'bg-[#ff5c45]' },
  { name: 'Soft salmon', value: '#FF7E6D', className: 'bg-[#ff7e6d]' },
  { name: 'Deep red', value: '#A12A2A', className: 'bg-[#a12a2a]' },
  { name: 'Navy', value: '#10131C', className: 'bg-[#10131c] ring-1 ring-inset ring-white/15' },
  { name: 'Slate', value: '#404962', className: 'bg-[#404962]' },
  { name: 'Off white', value: '#E1E1DD', className: 'bg-[#e1e1dd]' },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    alternates: {
      canonical: locale === 'en' ? '/brand' : `/${locale}/brand`,
      languages: { en: '/brand', es: '/es/brand', pt: '/pt/brand' },
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('brand');

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 md:grid-cols-[minmax(0,0.85fr)_minmax(320px,1.15fr)] md:py-20 lg:gap-20">
          <div className="max-w-xl">
            <p className="eyebrow mb-6 text-accent">{t('hero.eyebrow')}</p>
            <h1 className="font-display text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {t('hero.title')}
            </h1>
            <a
              href={LINKS.mediaKit}
              download
              className="mt-9 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl bg-accent px-6 py-3 text-sm font-bold text-[#10131c] transition-transform hover:-translate-y-0.5 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {t('hero.download')}
            </a>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ff5c45]">
            <Image
              src="/images/logo.png"
              alt={t('symbol.alt')}
              width={394}
              height={366}
              priority
              className="absolute left-1/2 top-1/2 h-auto w-[42%] -translate-x-1/2 -translate-y-1/2 brightness-0 invert"
            />
          </div>
        </section>

        <section className="border-y border-border-subtle bg-bg-secondary/45">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32">
            <h2 className="font-display max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              {t('symbol.title')}
            </h2>
            <div className="mt-14 grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-[#e1e1dd] p-10">
                <Image src="/images/logo.png" alt={t('symbol.darkAlt')} width={394} height={366} className="h-auto w-44" />
              </div>
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-[#ff5c45] p-10">
                <Image src="/images/app-icon.png" alt={t('symbol.appAlt')} width={176} height={176} className="h-auto w-40" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32">
          <h2 className="font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{t('logo.title')}</h2>
          <div className="mt-14 flex min-h-[360px] items-center justify-center rounded-2xl border border-border-subtle bg-[#2c3b56] px-8 py-16">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <Image src="/images/app-icon.png" alt="" width={176} height={176} className="h-28 w-28 sm:h-36 sm:w-36" />
              <Image src="/images/app-title.png" alt="Salmon" width={248} height={52} className="h-auto w-48 sm:w-64" />
            </div>
          </div>
        </section>

        <section className="border-y border-border-subtle bg-bg-secondary/45">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 md:py-32">
            <h2 className="font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{t('color.title')}</h2>
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {colors.map((color) => (
                <div key={color.value}>
                  <div className={`aspect-[4/5] rounded-2xl ${color.className}`} />
                  <p className="mt-4 text-sm font-medium text-text-primary">{color.name}</p>
                  <p className="mt-1 font-mono text-xs text-[#a7aab4]">{color.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-6 md:grid-cols-[0.72fr_1.28fr] md:items-end md:py-32">
          <div>
            <h2 className="font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{t('type.title')}</h2>
          </div>
          <div className="space-y-8 border-l border-border-subtle pl-6 sm:pl-10">
            <p className="text-5xl font-normal tracking-[-0.04em] sm:text-7xl">DM Sans Regular</p>
            <p className="text-5xl font-medium tracking-[-0.04em] sm:text-7xl">DM Sans Medium</p>
            <p className="text-5xl font-bold tracking-[-0.04em] sm:text-7xl">DM Sans Bold</p>
            <p className="font-mono text-sm text-[#b8bac2]">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789</p>
          </div>
        </section>

        <section className="border-t border-border-subtle px-5 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{t('texture.title')}</h2>
            <div className="mt-14 grid min-h-[420px] overflow-hidden rounded-2xl md:grid-cols-[1fr_0.32fr]">
              <div className="brand-scales bg-[#ff8170]" aria-label={t('texture.alt')} />
              <div className="grid grid-rows-2">
                <div className="bg-[#2a384e]" />
                <div className="bg-gradient-to-r from-[#ff8170] to-[#ff5c45]" />
              </div>
            </div>
            <a href={LINKS.mediaKit} download className="mt-10 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl bg-accent px-6 py-3 text-sm font-bold text-[#10131c] transition-transform hover:-translate-y-0.5 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              {t('download.cta')}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
