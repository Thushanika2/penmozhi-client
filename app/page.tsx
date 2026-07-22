"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartPulse,
  Languages,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/providers/language-provider"

export default function LandingPage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: CalendarDays,
      title: t("landing.features.cycleTrackingTitle"),
      description: t("landing.features.cycleTrackingDesc"),
      color: "from-primary/15 to-primary/5",
    },
    {
      icon: HeartPulse,
      title: t("landing.features.symptomTrendsTitle"),
      description: t("landing.features.symptomTrendsDesc"),
      color: "from-[var(--brand-light)]/15 to-[var(--brand-soft)]/10",
    },
    {
      icon: Sparkles,
      title: t("landing.features.aiAssistantTitle"),
      description: t("landing.features.aiAssistantDesc"),
      color: "from-[var(--brand-deep)]/15 to-primary/5",
    },
    {
      icon: BookOpen,
      title: t("landing.features.educationHubTitle"),
      description: t("landing.features.educationHubDesc"),
      color: "from-[var(--brand-soft)]/20 to-secondary",
    },
  ]

  const stats = [
    {
      label: t("landing.stats.bilingualLabel"),
      value: t("landing.stats.bilingualValue"),
      icon: Languages,
    },
    {
      label: t("landing.stats.forumLabel"),
      value: t("landing.stats.forumValue"),
      icon: Users,
    },
    {
      label: t("landing.stats.secureLabel"),
      value: t("landing.stats.secureValue"),
      icon: Shield,
    },
  ]

  const steps = [
    {
      step: "01",
      title: t("landing.howItWorks.step1Title"),
      desc: t("landing.howItWorks.step1Desc"),
    },
    {
      step: "02",
      title: t("landing.howItWorks.step2Title"),
      desc: t("landing.howItWorks.step2Desc"),
    },
    {
      step: "03",
      title: t("landing.howItWorks.step3Title"),
      desc: t("landing.howItWorks.step3Desc"),
    },
  ]

  return (
    <div className="relative min-h-svh overflow-hidden gradient-mesh">
      <div className="moon-glow -left-32 top-16 size-96 opacity-70" />
      <div className="moon-glow -right-20 top-1/3 size-80 opacity-50" />

      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-12 md:pt-20">
        {/* Hero */}
        <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full px-3 py-1" variant="secondary">
                {t("landing.badge")}
              </Badge>
              <span className="font-tamil text-sm font-medium text-primary">{t("brand.tamilMark")}</span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.5rem]">
              {t("landing.heroTitle")}{" "}
              <span className="brand-gradient-text">{t("landing.heroTitleHighlight")}</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("landing.heroDescription")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-7" render={<Link href="/auth/register" />}>
                {t("landing.createFreeAccount")}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7"
                render={<Link href="/education" />}
              >
                {t("landing.exploreEducation")}
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="stat-card">
                    <Icon className="mb-2 size-4 text-primary" />
                    <p className="text-sm font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-[var(--brand-light)]/15 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
              <BrandLogo href="/" size="xl" showTagline />
              <p className="relative mt-6 text-sm leading-relaxed text-muted-foreground">
                {t("landing.cardDescription")}
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">
                  {t("landing.cardBadges.cycleAi")}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {t("landing.cardBadges.pcosTracking")}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {t("landing.cardBadges.reminders")}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <p className="section-eyebrow">{t("landing.howItWorks.eyebrow")}</p>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.howItWorks.title")}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="bento-card">
                <span className="font-heading text-3xl font-bold text-primary/30">{item.step}</span>
                <h3 className="mt-3 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-24">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-eyebrow">{t("landing.features.eyebrow")}</p>
              <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {t("landing.features.title")}
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              {t("landing.features.description")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="group bento-card">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="bento-icon">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-24 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[var(--brand-light)]/8 to-[var(--brand-soft)]/10" />
          <div className="moon-glow right-0 top-0 size-64 opacity-40" />
          <div className="relative text-center">
            <p className="font-tamil text-lg font-medium text-primary">{t("brand.tamilMark")}</p>
            <h2 className="font-heading mt-2 text-2xl font-bold md:text-4xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("landing.cta.description")}
            </p>
            <Button size="lg" className="mt-8 rounded-full px-10" render={<Link href="/auth/register" />}>
              {t("landing.cta.button")}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
