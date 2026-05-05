import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Control Capital — Gestiona tus finanzas personales gratis",
    template: "%s | Control Capital",
  },
  description: "Controla tus ingresos, gastos y metas de ahorro desde cualquier dispositivo. App de finanzas personales gratuita y sin publicidad.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "app ahorro",
    "gestión dinero",
    "presupuesto personal",
    "app finanzas gratis",
    "controlar gastos mensuales",
    "ahorrar dinero",
    "gestión presupuesto",
  ],
  metadataBase: new URL("https://controlcapital.es"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Control Capital — Gestiona tus finanzas personales gratis",
    description: "Controla tus ingresos, gastos y metas de ahorro desde cualquier dispositivo. Gratis y sin publicidad.",
    url: "https://controlcapital.es",
    siteName: "Control Capital",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Control Capital — Gestiona tus finanzas personales gratis",
    description: "Controla tus ingresos, gastos y metas de ahorro desde cualquier dispositivo. Gratis y sin publicidad.",
  },
  verification: {
    google: process.env.CODIGO_VERIFICACION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>

        {/* 1. Google Consent Mode v2 — debe ir primero */}
        <Script id="google-consent-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied'
            });
          `}
        </Script>

        {/* 2. Iubenda — carga antes que GA para bloquear correctamente */}
        <Script
          src="https://embeds.iubenda.com/widgets/f2eefb2b-2006-4912-837f-5b410281e7b5.js"
          strategy="beforeInteractive"
        />

        {/* 3. Google Analytics — arranca denegado hasta que iubenda dé el OK */}
        <GoogleAnalytics gaId="G-44CLSF01XV" />

      </body>
    </html>
  )
}