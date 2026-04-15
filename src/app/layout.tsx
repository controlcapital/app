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
  title: "Control Capital",
  description: "Controla tus ingresos, gastos y metas de ahorro desde cualquier dispositivo. Gratis y sin publicidad.",
  keywords: ["finanzas personales", "control de gastos", "app ahorro", "gestión dinero", "presupuesto personal"],
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
        <GoogleAnalytics gaId="G-44CLSF01XV" />
        <Script
          src="https://embeds.iubenda.com/widgets/f2eefb2b-2006-4912-837f-5b410281e7b5.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}