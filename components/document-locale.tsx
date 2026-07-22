"use client"

import * as React from "react"

import { useLanguage } from "@/providers/language-provider"

export function DocumentLocale() {
  const { locale, t } = useLanguage()

  React.useEffect(() => {
    document.documentElement.lang = locale
    document.title = t("metadata.title")
  }, [locale, t])

  return null
}
