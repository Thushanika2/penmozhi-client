"use client"

import * as React from "react"

import { THEME_STORAGE_KEY } from "@/lib/theme-script"

type Theme = "dark" | "light" | "system"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light" | undefined
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const listeners = new Set<() => void>()

function emitThemeChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", emitThemeChange)
  window.addEventListener("storage", emitThemeChange)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", emitThemeChange)
    window.removeEventListener("storage", emitThemeChange)
  }
}

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme {
  return (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system"
}

function resolveTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme
}

function applyResolved(resolved: "dark" | "light") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getStoredTheme, () => "system" as Theme)
  const resolvedTheme = React.useSyncExternalStore(
    subscribe,
    () => resolveTheme(getStoredTheme()),
    () => undefined,
  )

  React.useEffect(() => {
    if (resolvedTheme) applyResolved(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyResolved(resolveTheme(next))
    emitThemeChange()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key?.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, useTheme }
