import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalDocument from '@/components/LegalDocument';
import { getPowerupsLegal } from '@/lib/legal-powerups.mjs';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'en' ? '/privacy' : `/${locale}/privacy`,
      languages: { en: '/privacy', es: '/es/privacy', pt: '/pt/privacy' },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const document = getPowerupsLegal(locale, 'privacy');

  return (
    <>
      <Navbar />
      <LegalDocument document={document} />
      <Footer />
    </>
  );
}
