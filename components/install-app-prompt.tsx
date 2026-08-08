"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISSED_KEY = "penmozhi-install-prompt-dismissed"

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "true") return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => setInstallEvent(null)

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  if (!installEvent) return null

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setInstallEvent(null)
  }

  const install = async () => {
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === "accepted") {
      setInstallEvent(null)
    } else {
      dismiss()
    }
  }

  return (
    <aside
      aria-label="Install Penmozhi"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary/30 bg-card/95 p-3 text-card-foreground shadow-2xl backdrop-blur md:bottom-6"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Install Penmozhi</p>
        <p className="text-sm text-muted-foreground">
          Add the app to your home screen for quick access.
        </p>
      </div>
      <Button size="sm" onClick={install}>
        <Download aria-hidden="true" />
        Install
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss install prompt"
        onClick={dismiss}
      >
        <X aria-hidden="true" />
      </Button>
    </aside>
  )
}
