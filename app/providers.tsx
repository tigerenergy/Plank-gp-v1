'use client'

import { Suspense } from 'react'
import { ThemeProvider } from 'next-themes'
import { NavigationLoader } from '@/app/components/NavigationLoader'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Suspense fallback={null}>
        <NavigationLoader />
      </Suspense>
    </ThemeProvider>
  )
}
