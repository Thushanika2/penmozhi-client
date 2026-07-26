"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import { verifyAppLock } from "@/services/auth"

const SESSION_KEY = "penmozhi_app_unlocked"

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [unlocked, setUnlocked] = React.useState(false)
  const [pin, setPin] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const needsLock = Boolean(user?.has_app_lock)

  React.useEffect(() => {
    if (!needsLock) {
      setUnlocked(true)
      return
    }
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === String(user?.id)) {
      setUnlocked(true)
    }
  }, [needsLock, user?.id])

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await verifyAppLock(pin)
      if (result.verified) {
        sessionStorage.setItem(SESSION_KEY, String(user?.id))
        setUnlocked(true)
      }
    } catch (err) {
      setError(getLocalizedApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  if (!needsLock || unlocked) {
    return <>{children}</>
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold">{t("appLock.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("appLock.description")}</p>
          <div className="space-y-2">
            <Label htmlFor="app-lock-pin">{t("appLock.pinLabel")}</Label>
            <Input
              id="app-lock-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting || !pin}>
            {submitting ? t("common.loading") : t("appLock.unlock")}
          </Button>
        </form>
      </div>
      <div className="pointer-events-none opacity-0">{children}</div>
    </>
  )
}
