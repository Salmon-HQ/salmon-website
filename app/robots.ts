import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The phone screens are frames inside the home page, not pages of their own.
      disallow: ['/phone-preview', '/powerup-rows'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
