"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { useLanguage } from "@/providers/language-provider"

export function SiteFooter() {
  const { t } = useLanguage()

  const links = [
    { href: "/education", label: t("footer.links.education") },
    { href: "/auth/login", label: t("footer.links.signIn") },
    { href: "/auth/register", label: t("footer.links.register") },
  ]

  const featureItems = [
    t("footer.featureItems.cycleTracking"),
    t("footer.featureItems.aiAssistant"),
    t("footer.featureItems.privateForum"),
  ]

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <BrandLogo linked={false} size="md" showTagline />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("footer.explore")}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("footer.features")}
              </p>
              <ul className="space-y-2 text-sm text-foreground/80">
                {featureItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.privacyNote")}</p>
        </div>
      </div>
    </footer>
  )
}
