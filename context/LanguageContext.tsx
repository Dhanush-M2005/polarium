'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (en: string, hi: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (en: string) => en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('polarium_language') as Language | null
    if (saved === 'hi' || saved === 'en') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('polarium_language', lang)
  }, [])

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const nextLang = prev === 'en' ? 'hi' : 'en'
      localStorage.setItem('polarium_language', nextLang)
      return nextLang
    })
  }, [])

  const t = React.useCallback(
    (en: string, hi: string) => {
      return language === 'hi' ? hi : en
    },
    [language]
  )

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
