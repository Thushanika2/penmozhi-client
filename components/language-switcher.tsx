"use client"

import { Select } from "@/components/ui/select"
import { useLanguage } from "@/providers/language-provider"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <Select
      aria-label={t("common.selectLanguage")}
      className="w-auto min-w-24 rounded-full"
      value={locale}
      onChange={(event) => {
        const next = event.target.value === "ta" ? "ta" : "en"
        void setLocale(next)
      }}
    >
      <option value="en">{t("languageSwitcher.english")}</option>
      <option value="ta">{t("languageSwitcher.tamil")}</option>
    </Select>
  )
}
