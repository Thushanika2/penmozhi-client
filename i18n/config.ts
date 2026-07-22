import type { LanguagePreference } from "@/types/user-profile"

export type Locale = "en" | "ta"

export const supportedLocales: Locale[] = ["en", "ta"]
export const defaultLocale: Locale = "en"
export const LANGUAGE_STORAGE_KEY = "penmozhi_language"

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ta"
}

export function preferenceToLocale(preference: LanguagePreference | string | null | undefined): Locale {
  if (preference === "tamil") return "ta"
  return "en"
}

export function localeToPreference(locale: Locale): LanguagePreference {
  return locale === "ta" ? "tamil" : "english"
}
