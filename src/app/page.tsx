'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider } from '../app/context/Theme.context'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a /login
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirigiendo...</div>
    </div>
  )

}


export function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )

}