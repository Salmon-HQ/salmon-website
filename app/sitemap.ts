import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.salmonwallet.io/',
      lastModified: new Date(),
      images: ['https://www.salmonwallet.io/screens/home.webp', 'https://www.salmonwallet.io/screens/swap.webp'],
    },
  ];
}
