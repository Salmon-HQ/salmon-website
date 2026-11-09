import LegalDocument, { legalMetadata, type LegalLocale } from '@/components/legal/LegalDocument';

// Spanish and Portuguese texts at /es/privacy and /pt/privacy; English lives at /privacy.
export const dynamicParams = false;
export const generateStaticParams = () => [{ locale: 'es' }, { locale: 'pt' }];

type Props = { params: Promise<{ locale: LegalLocale }> };

export async function generateMetadata({ params }: Props) {
  return legalMetadata('privacy', (await params).locale);
}

export default async function LocalizedPrivacyPage({ params }: Props) {
  return <LegalDocument kind="privacy" locale={(await params).locale} />;
}
