'use client'

import React from 'react'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from './ThemeProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  )
}
