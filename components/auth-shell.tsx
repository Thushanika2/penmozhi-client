"use client"

import { BrandLogo } from "@/components/brand-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/providers/language-provider"

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()

  const highlights = [
    {
      title: t("authShell.highlights.cycleTrackingTitle"),
      desc: t("authShell.highlights.cycleTrackingDesc"),
    },
    {
      title: t("authShell.highlights.bilingualTitle"),
      desc: t("authShell.highlights.bilingualDesc"),
    },
    {
      title: t("authShell.highlights.privacyTitle"),
      desc: t("authShell.highlights.privacyDesc"),
    },
    {
      title: t("authShell.highlights.insightsTitle"),
      desc: t("authShell.highlights.insightsDesc"),
    },
  ]

  return (
    <div className="relative min-h-svh lg:grid lg:grid-cols-[1fr_1fr]">
      <div className="auth-panel relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="moon-glow -left-20 top-10 size-64" />
        <div className="moon-glow right-0 top-1/3 size-48 opacity-60" />

        <BrandLogo size="lg" showTagline />

        <div className="relative z-10 max-w-md space-y-8">
          <div>
            <p className="font-tamil text-2xl font-semibold text-primary">{t("brand.tamilMark")}</p>
            <h2 className="font-heading mt-2 text-4xl font-bold leading-tight tracking-tight text-foreground">
              {t("authShell.title")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("authShell.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="glass-panel rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-4">
          <BrandLogo linked={false} size="xl" className="items-center opacity-90" />
        </div>
      </div>

      <div className="gradient-mesh relative flex min-h-svh items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
