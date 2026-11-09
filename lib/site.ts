import type { Metadata } from 'next';

// The address the site is served from: Vercel redirects the bare domain to www, and the mobile app reads
// https://www.salmonwallet.io/app/mobile-release.json.
export const SITE_URL = 'https://www.salmonwallet.io';

// The link-preview image. Apps cache previews by image URL, so bump `v` whenever the file changes, or they keep
// showing the old picture.
export const SHARING_IMAGE = {
  url: `${SITE_URL}/images/sharing-og.png?v=20261109`,
  width: 1200,
  height: 630,
  alt: 'Salmon: one wallet, only what you need. Modular Solana wallet for Chrome, iOS, Android and Seeker.',
};

/** Open Graph and Twitter tags for a Next page, all with the same preview image. */
export function sharingMetadata(title: string, description: string, path: string): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: { type: 'website', siteName: 'Salmon Wallet', title, description, url: `${SITE_URL}${path}`, images: [SHARING_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARING_IMAGE] },
  };
}

export const DOCS_URL = 'https://docs.salmonwallet.io';
export const GITHUB_URL = 'https://github.com/Salmon-HQ';

// The Salmon API: the backend of the wallet apps. Its OpenAPI description lives in the backend repo and is copied to
// public/openapi.{yaml,json} by scripts/sync-openapi.mjs.
export const API_URL = 'https://api.salmonwallet.io';
export const API_DOCS_URL = `${DOCS_URL}/developer-zone/10_backend_api_reference`;
export const API_SOURCE_URL = `${GITHUB_URL}/salmon-wallet-backend`;
export const OPENAPI_URL = `${SITE_URL}/openapi.json`;

// The home's title and description, shared by its <head> and the default metadata of the Next pages.
export const HOME_TITLE = 'Salmon: Lightweight, Self-Custodial Solana Wallet with Powerups';
export const HOME_DESCRIPTION =
  'Salmon is a lightweight, self-custodial Solana wallet. Keep the essentials and add Powerups only when you need them.';

/** Store listings. Seeker installs go through /seeker, which hands Seeker devices to the dApp Store listing. */
export const STORE_URLS = {
  chrome: 'https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll',
  // TODO(ios): the docs say iOS is "not yet generally available" while the site links this App Store listing.
  ios: 'https://apps.apple.com/app/salmon-open-wallet/id6799740991',
  android: 'https://play.google.com/store/apps/details?id=io.salmonwallet.app',
  seeker: `${SITE_URL}/seeker`,
  dappStore: 'solanadappstore://details?id=io.salmonwallet.app',
} as const;

// TODO(seeker-ua): confirm the user agent a Seeker's browser sends. This matches a "Seeker" token (and the Saga,
// which also ships the Solana dApp Store); check it against a real device before relying on it.
const DAPP_STORE_DEVICE_UA = /\b(Seeker|Saga)\b/i;

/** Whether the request comes from a phone that has the Solana dApp Store (Seeker, Saga). */
export function isDappStoreDevice(userAgent: string) {
  return /Android/i.test(userAgent) && DAPP_STORE_DEVICE_UA.test(userAgent);
}

/** Schema.org description of Salmon for search engines, from the previous site with the current store links. */
export function structuredData() {
  const organizationId = `${SITE_URL}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Salmon Wallet',
        description: 'Open-source, self-custodial wallet infrastructure for Solana.',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/images/app-icon.png`,
        email: 'integrations@salmonwallet.io',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'integrations@salmonwallet.io',
          contactType: 'integrations and product enquiries',
          availableLanguage: ['English', 'Spanish', 'Portuguese'],
        },
        knowsAbout: ['Solana wallet', 'Self-custodial wallet', 'Solana'],
        address: { '@type': 'PostalAddress', addressLocality: 'Buenos Aires', addressCountry: 'AR' },
        sameAs: ['https://x.com/salmonwallet', GITHUB_URL, 'https://t.me/salmon_wallet', 'https://medium.com/@salmonwallet'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Salmon Wallet',
        description: 'A lightweight, self-custodial Solana wallet that expands through optional Powerups. Open source.',
        url: `${SITE_URL}/`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'iOS, Android, Chrome',
        isAccessibleForFree: true,
        publisher: { '@id': organizationId },
        keywords: 'Solana wallet, self-custodial wallet, Powerups, Solana validator',
        codeRepository: GITHUB_URL,
        downloadUrl: [STORE_URLS.ios, STORE_URLS.android, STORE_URLS.chrome, STORE_URLS.seeker],
      },
      {
        '@type': 'WebAPI',
        '@id': `${SITE_URL}/api#webapi`,
        name: 'Salmon Wallet API',
        description: 'Public HTTP API behind the Salmon wallet apps: networks, balances, activity, tokens, NFTs and market data.',
        url: `${SITE_URL}/api`,
        documentation: API_DOCS_URL,
        provider: { '@id': organizationId },
      },
      {
        '@type': 'WebSite',
        name: 'Salmon Wallet',
        url: `${SITE_URL}/`,
        publisher: { '@id': organizationId },
        inLanguage: 'en',
      },
    ],
  };
}
