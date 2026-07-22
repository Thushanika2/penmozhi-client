"use client"

import * as React from "react"
import { toast } from "sonner"

import enMessages from "@/i18n/messages/en.json"
import taMessages from "@/i18n/messages/ta.json"
import {
  defaultLocale,
  isLocale,
  LANGUAGE_STORAGE_KEY,
  localeToPreference,
  preferenceToLocale,
  type Locale,
} from "@/i18n/config"
import { updateLanguagePreference } from "@/services/auth"
import { useAuth } from "@/providers/auth-provider"

type Messages = Record<string, unknown>
type TranslateValues = Record<string, string | number>

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  t: (key: string, values?: TranslateValues) => string
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined)

const resources: Record<Locale, Messages> = {
  en: enMessages as Messages,
  ta: taMessages as Messages,
}

function getNestedValue(obj: Messages, key: string): string | undefined {
  const parts = key.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in (current as Record<string, unknown>))) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === "string" ? current : undefined
}

function interpolate(template: string, values?: TranslateValues): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? `{${token}}`))
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth()
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const fromStorage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isLocale(fromStorage)) {
      queueMicrotask(() => setLocaleState(fromStorage))
    }
  }, [])

  React.useEffect(() => {
    if (!user?.language_preference) return
    const next = preferenceToLocale(user.language_preference)
    queueMicrotask(() => setLocaleState(next))
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    }
  }, [user?.language_preference])

  const t = React.useCallback(
    (key: string, values?: TranslateValues) => {
      const localized = getNestedValue(resources[locale], key)
      const fallback = getNestedValue(resources.en, key)
      return interpolate(localized ?? fallback ?? key, values)
    },
    [locale],
  )

  const setLocale = React.useCallback(
    async (next: Locale) => {
      setLocaleState(next)
      if (typeof window !== "undefined") {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
      }

      if (!user) return

      try {
        const response = await updateLanguagePreference(localeToPreference(next))
        if (response.user) {
          updateUser(() => response.user)
        }
        toast.success(t("languageSwitcher.updateSuccess"))
      } catch {
        toast.error(t("languageSwitcher.updateFailed"))
      }
    },
    [t, updateUser, user],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
