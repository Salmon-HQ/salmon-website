// The address the site is served from: Vercel redirects the bare domain to www, and the mobile app reads
// https://www.salmonwallet.io/app/mobile-release.json.
export const SITE_URL = 'https://www.salmonwallet.io';

export const DOCS_URL = 'https://docs.salmonwallet.io';
export const GITHUB_URL = 'https://github.com/Salmon-HQ';

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
        // TODO(address): add a PostalAddress here once the legal address to publish is confirmed.
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
        codeRepository: GITHUB_URL,
        downloadUrl: [STORE_URLS.ios, STORE_URLS.android, STORE_URLS.chrome, STORE_URLS.seeker],
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
