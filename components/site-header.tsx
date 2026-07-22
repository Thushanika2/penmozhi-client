"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"

interface SiteHeaderProps {
  className?: string
  maxWidth?: "4xl" | "6xl"
  showAuth?: boolean
  children?: React.ReactNode
}

export function SiteHeader({
  className,
  maxWidth = "6xl",
  showAuth = true,
  children,
}: SiteHeaderProps) {
  const { t } = useLanguage()

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full border-b border-border/40 glass-panel",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between px-4 py-3 md:py-4",
            maxWidth === "4xl" ? "max-w-4xl" : "max-w-6xl",
          )}
        >
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {children}
            {showAuth ? (
              <>
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex"
                  render={<Link href="/education" />}
                >
                  {t("header.education")}
                </Button>
                <Button variant="outline" className="rounded-full" render={<Link href="/auth/login" />}>
                  {t("header.login")}
                </Button>
                <Button className="rounded-full" render={<Link href="/auth/register" />}>
                  {t("header.getStarted")}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <div aria-hidden className="h-16 shrink-0 md:h-[4.5rem]" />
    </>
  )
}
