"use client"

import { Moon, Sun } from "lucide-react"
import * as React from "react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"

function useIsMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useLanguage()
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label={t("themeToggle.toggleTheme")}>
        <Sun className="size-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? t("themeToggle.switchToLight") : t("themeToggle.switchToDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
