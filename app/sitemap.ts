import type { MetadataRoute } from 'next';
import { SITE_URL as BASE_URL } from '@/lib/site';

// Bump when the pages' content changes.
const LAST_MODIFIED = new Date('2026-11-09');

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'es', 'pt'];
  const pages = [
    { path: '', changeFrequency: 'monthly' as const, priority: 1.0 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/seeker', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/api', changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  // Only the legal pages have Spanish and Portuguese versions.
  return pages.flatMap((page) =>
    (page.path === '/terms' || page.path === '/privacy' ? locales : ['en']).map((locale) => ({
      url: `${BASE_URL}${locale === 'en' ? '' : `/${locale}`}${page.path}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );
}
