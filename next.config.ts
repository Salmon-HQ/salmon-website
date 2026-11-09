import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The phone screens are Next pages inside iframes, so the dev badge would
  // render inside every phone mock.
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  // Addresses of the previous site keep working: retired pages land on the home, English drops its /en prefix,
  // and only the legal pages exist in Spanish and Portuguese.
  async redirects() {
    return [
      { source: '/powerups/:kind(terms|privacy)', destination: '/:kind', permanent: true },
      { source: '/:locale(es|pt)/powerups/:kind(terms|privacy)', destination: '/:locale/:kind', permanent: true },
      { source: '/en/powerups/:kind(terms|privacy)', destination: '/:kind', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(es|pt)', destination: '/', permanent: true },
      { source: '/:locale(es|pt)/contact', destination: '/contact', permanent: true },
      { source: '/:locale(es|pt)/:page(about|brand|developers)', destination: '/', permanent: true },
      { source: '/:page(about|brand|developers)', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
