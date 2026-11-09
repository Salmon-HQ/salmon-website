import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Salmon — One wallet. Only what you need.',
  description: 'A lightweight Solana wallet that expands through optional Powerups.',
  metadataBase: new URL('https://salmonwallet.io'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
