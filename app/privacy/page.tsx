import LegalDocument, { legalMetadata } from '@/components/legal/LegalDocument';

export const metadata = legalMetadata('privacy');

export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
