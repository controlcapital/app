/*un archivo independiente que los rastreadores leen antes de entrar a tu web. Es el estándar universal que entienden todos los bots (Google, Bing, etc.).
puedes bloquear rutas privadas como /dashboard para que Google no intente indexarlas */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/'],
    },
    sitemap: 'https://controlcapital.es/sitemap.xml',
  }
}