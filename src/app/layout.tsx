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
  title: "Control Capital - Finanzas del Hogar",
  description: "Gestión de gastos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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