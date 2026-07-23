"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  Languages,
  LineChart,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/providers/language-provider"

export default function LandingPage() {
  const { t } = useLanguage()

  const stats = [
    { label: t("landing.stats.bilingualLabel"), value: t("landing.stats.bilingualValue"), icon: Languages },
    { label: t("landing.stats.scienceLabel"), value: t("landing.stats.scienceValue"), icon: TrendingUp },
    { label: t("landing.stats.secureLabel"), value: t("landing.stats.secureValue"), icon: Shield },
  ]

  const steps = [
    { step: "01", title: t("landing.howItWorks.step1Title"), desc: t("landing.howItWorks.step1Desc") },
    { step: "02", title: t("landing.howItWorks.step2Title"), desc: t("landing.howItWorks.step2Desc") },
    { step: "03", title: t("landing.howItWorks.step3Title"), desc: t("landing.howItWorks.step3Desc") },
  ]

  const features = [
    { icon: CalendarDays, title: t("landing.features.cycleTrackingTitle"), description: t("landing.features.cycleTrackingDesc") },
    { icon: Heart, title: t("landing.features.symptomTrendsTitle"), description: t("landing.features.symptomTrendsDesc") },
    { icon: Sparkles, title: t("landing.features.predictionsTitle"), description: t("landing.features.predictionsDesc") },
    { icon: TrendingUp, title: t("landing.features.fertilityTitle"), description: t("landing.features.fertilityDesc") },
    { icon: LineChart, title: t("landing.features.insightsTitle"), description: t("landing.features.insightsDesc") },
    { icon: BookOpen, title: t("landing.features.educationHubTitle"), description: t("landing.features.educationHubDesc") },
  ]

  const privacyPoints = [
    { title: t("landing.privacy.points.noSellingTitle"), desc: t("landing.privacy.points.noSellingDesc"), icon: Lock },
    { title: t("landing.privacy.points.youControlTitle"), desc: t("landing.privacy.points.youControlDesc"), icon: Shield },
    { title: t("landing.privacy.points.secureTitle"), desc: t("landing.privacy.points.secureDesc"), icon: Shield },
  ]

  const testimonials = [
    t("landing.testimonials.quote1"),
    t("landing.testimonials.quote2"),
    t("landing.testimonials.quote3"),
  ]

  return (
    <div className="relative min-h-svh overflow-hidden gradient-mesh">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-12 md:pt-20">
        {/* Hero — Clue-style */}
        <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <Badge className="rounded-full px-3 py-1" variant="secondary">
              {t("landing.badge")}
            </Badge>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
              {t("landing.heroTitle")}{" "}
              <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("landing.heroDescription")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-7" render={<Link href="/auth/register" />}>
                {t("landing.createFreeAccount")}
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-7" render={<Link href="/education" />}>
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

          {/* Cycle wheel mockup */}
          <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
            <div className="relative flex size-72 items-center justify-center rounded-full p-3 shadow-xl shadow-primary/10">
              <div className="clue-hero-ring absolute inset-0 rounded-full" />
              <div className="relative flex size-44 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("dashboard.cycleWheel.cycleDay")}
                </p>
                <p className="text-5xl font-bold text-primary">14</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.phases.follicular")}</p>
              </div>
              <div className="absolute -right-2 top-8 rounded-2xl border border-border bg-card px-4 py-2 text-sm shadow-md">
                {t("dashboard.cards.nextPeriod")}
              </div>
              <div className="absolute -left-2 bottom-8 rounded-2xl border border-border bg-card px-4 py-2 text-sm shadow-md">
                {t("landing.features.predictionsTitle")}
              </div>
            </div>
            <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground">
              {t("landing.cardDescription")}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <p className="section-eyebrow">{t("landing.howItWorks.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.howItWorks.title")}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="bento-card">
                <span className="text-3xl font-bold text-primary/25">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section className="mt-24">
          <p className="section-eyebrow">{t("landing.features.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.features.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("landing.features.description")}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="bento-card">
                  <div className="bento-icon">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        {/* Privacy section — Clue-style */}
        <section className="mt-24 rounded-3xl border border-border bg-muted/40 p-8 md:p-12">
          <p className="section-eyebrow">{t("landing.privacy.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("landing.privacy.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{t("landing.privacy.description")}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {privacyPoints.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="rounded-2xl border border-border bg-card p-5">
                  <Icon className="mb-3 size-5 text-primary" />
                  <h3 className="font-semibold">{point.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{point.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-24">
          <p className="section-eyebrow">{t("landing.testimonials.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{t("landing.testimonials.title")}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((quote) => (
              <blockquote key={quote} className="bento-card text-sm leading-relaxed text-muted-foreground">
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-24 overflow-hidden rounded-3xl border border-primary/15 bg-accent p-8 md:p-14">
          <div className="relative text-center">
            <p className="font-tamil text-lg font-medium text-primary">{t("brand.tamilMark")}</p>
            <h2 className="mt-2 text-2xl font-bold md:text-4xl">{t("landing.cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("landing.cta.description")}</p>
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
