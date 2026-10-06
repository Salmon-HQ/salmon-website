import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
  // The Power-ups 1.4 texts are the only terms and privacy policy; their old links land on the single pages.
  async redirects() {
    return [
      { source: '/powerups/:kind(terms|privacy)', destination: '/:kind', permanent: true },
      { source: '/:locale(en|es|pt)/powerups/:kind(terms|privacy)', destination: '/:locale/:kind', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
