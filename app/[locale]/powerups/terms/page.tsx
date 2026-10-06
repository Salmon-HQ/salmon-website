import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PowerupsLegalDocument from '@/components/PowerupsLegalDocument';
import { getPowerupsLegal } from '@/lib/legal-powerups.mjs';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const document = getPowerupsLegal(locale, 'terms');
  return {
    title: document.title,
    description: document.intro,
    alternates: {
      canonical: locale === 'en' ? '/powerups/terms' : `/${locale}/powerups/terms`,
      languages: { en: '/powerups/terms', es: '/es/powerups/terms', pt: '/pt/powerups/terms' },
    },
  };
}

export default async function PowerupsTermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <PowerupsLegalDocument document={getPowerupsLegal(locale, 'terms')} />
      <Footer />
    </>
  );
}
