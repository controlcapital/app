'use client'

import { ThemeProvider } from './context/Theme.context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}