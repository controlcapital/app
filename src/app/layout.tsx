import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

// ── CONFIGURACIÓN DE FUENTE ──
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ── METADATOS UNIFICADOS CON LA LANDING ──
export const metadata: Metadata = {
  title: {
    default: "Control Capital — Gestiona la economía de tu hogar",
    template: "%s | Control Capital",
  },
  description: "Descubre dónde va tu dinero y optimiza el presupuesto de tu casa. La herramienta definitiva para alcanzar vuestras metas de ahorro en común.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "app ahorro",
    "gestión dinero",
    "presupuesto personal",
    "finanzas hogar",
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
    title: "Control Capital — Gestiona la economía de tu hogar",
    description: "Descubre dónde va tu dinero y optimiza el presupuesto de tu casa. La herramienta definitiva para alcanzar vuestras metas de ahorro en común.",
    url: "https://controlcapital.es",
    siteName: "Control Capital",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Control Capital — Gestiona la economía de tu hogar",
    description: "Descubre dónde va tu dinero y optimiza el presupuesto de tu casa. La herramienta definitiva para alcanzar vuestras metas de ahorro en común.",
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
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
  );
}