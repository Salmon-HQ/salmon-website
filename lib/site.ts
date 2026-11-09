// The address the site is served from: Vercel redirects the bare domain to www, and the mobile app reads
// https://www.salmonwallet.io/app/mobile-release.json.
export const SITE_URL = 'https://www.salmonwallet.io';

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
        sameAs: ['https://x.com/salmonwallet', 'https://github.com/Salmon-HQ', 'https://t.me/salmon_wallet', 'https://medium.com/@salmonwallet'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Salmon Wallet',
        description: 'A lightweight Solana wallet that expands through optional Powerups.',
        url: `${SITE_URL}/`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'iOS, Android, Chrome',
        isAccessibleForFree: true,
        publisher: { '@id': organizationId },
        downloadUrl: [
          'https://apps.apple.com/app/salmon-open-wallet/id6799740991',
          'https://play.google.com/store/apps/details?id=io.salmonwallet.app',
          'https://chromewebstore.google.com/detail/salmon-wallet/ejbidfepgijlcgahbmbckmnaljagjoll',
        ],
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
