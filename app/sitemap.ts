import type { MetadataRoute } from 'next';

const BASE_URL = 'https://salmonwallet.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'es', 'pt'];
  const pages = [
    { path: '', changeFrequency: 'monthly' as const, priority: 1.0 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  // Only the legal pages have Spanish and Portuguese versions.
  return pages.flatMap((page) =>
    (page.path === '/terms' || page.path === '/privacy' ? locales : ['en']).map((locale) => ({
      url: `${BASE_URL}${locale === 'en' ? '' : `/${locale}`}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );
}
