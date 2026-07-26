"use client"

import * as React from "react"
import { toast } from "sonner"

import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { useAuth } from "@/providers/auth-provider"
import { updateMode } from "@/services/auth"
import type { TrackingMode } from "@/types/user-profile"

const MODES: TrackingMode[] = [
  "period",
  "conceive",
  "pregnancy",
  "perimenopause",
  "non_bleeding",
]

export function ModeSwitcher() {
  const { t } = useLanguage()
  const { user, refreshProfile } = useAuth()
  const [saving, setSaving] = React.useState(false)

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const mode = event.target.value as TrackingMode
    setSaving(true)
    try {
      await updateMode(mode)
      await refreshProfile()
      toast.success(t("mode.updated"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-1 px-4 py-2">
      <Label className="text-xs text-muted-foreground">{t("mode.label")}</Label>
      <Select
        value={user?.mode ?? "period"}
        onChange={handleChange}
        disabled={saving}
        className="w-full text-sm"
      >
        {MODES.map((mode) => (
          <option key={mode} value={mode}>
            {t(`mode.options.${mode}`)}
          </option>
        ))}
      </Select>
    </div>
  )
}
