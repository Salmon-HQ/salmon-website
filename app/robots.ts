import type { MetadataRoute } from 'next';

// Open to every crawler, AI search bots included (OAI-SearchBot, Claude-SearchBot,
// PerplexityBot): being cited in AI answers is the goal.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/phone-preview' },
    sitemap: 'https://www.salmonwallet.io/sitemap.xml',
  };
}
