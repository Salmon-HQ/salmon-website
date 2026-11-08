import LegalDocument, { legalMetadata } from '@/components/legal/LegalDocument';

export const metadata = legalMetadata('terms');

export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
