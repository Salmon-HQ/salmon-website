import type { Metadata } from 'next';
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL, sharingMetadata } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  ...sharingMetadata(HOME_TITLE, HOME_DESCRIPTION, '/'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
