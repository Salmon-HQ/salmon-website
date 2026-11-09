import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: 'Salmon — One wallet. Only what you need.',
  description: 'A lightweight Solana wallet that expands through optional Powerups.',
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
