import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://controlcapital.es',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // cuando tengas más páginas públicas, añádelas aquí
    // { url: 'https://controlcapital.es/blog', ... }
  ]
}