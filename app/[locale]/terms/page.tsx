import LegalDocument, { legalMetadata, type LegalLocale } from '@/components/legal/LegalDocument';

// Spanish and Portuguese texts at /es/terms and /pt/terms; English lives at /terms.
export const dynamicParams = false;
export const generateStaticParams = () => [{ locale: 'es' }, { locale: 'pt' }];

type Props = { params: Promise<{ locale: LegalLocale }> };

export async function generateMetadata({ params }: Props) {
  return legalMetadata('terms', (await params).locale);
}

export default async function LocalizedTermsPage({ params }: Props) {
  return <LegalDocument kind="terms" locale={(await params).locale} />;
}
