import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The phone screens are Next pages inside iframes, so the dev badge would
  // render inside every phone mock.
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  // Pages answer in Markdown or HTML depending on Accept (proxy.ts). Set here because Next replaces a Vary set by
  // the proxy with its own on Next pages, but appends to this one; /seeker also depends on the user agent.
  async headers() {
    return [
      { source: '/((?!_next/|phone-preview|powerup-rows|.*\\..*).*)', headers: [{ key: 'Vary', value: 'Accept' }] },
      { source: '/seeker', headers: [{ key: 'Vary', value: 'Accept, User-Agent' }] },
      { source: '/openapi.yaml', headers: [{ key: 'Content-Type', value: 'application/yaml; charset=utf-8' }] },
    ];
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
      { source: '/:locale(es|pt)/:page(about|brand)', destination: '/', permanent: true },
      { source: '/:page(about|brand)', destination: '/', permanent: true },
      // The previous site's "API Docs & Developer Resources" page.
      { source: '/:locale(es|pt)/developers', destination: '/api', permanent: true },
      { source: '/developers', destination: '/api', permanent: true },
    ];
  },
};

export default nextConfig;
