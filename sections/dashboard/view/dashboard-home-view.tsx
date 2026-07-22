"use client"

import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  HeartPulse,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

const modules = [
  {
    href: "/dashboard/cycle",
    titleKey: "dashboard.modules.cycleTracking.title",
    descriptionKey: "dashboard.modules.cycleTracking.description",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/symptoms",
    titleKey: "dashboard.modules.symptoms.title",
    descriptionKey: "dashboard.modules.symptoms.description",
    icon: Activity,
  },
  {
    href: "/dashboard/pcos-status",
    titleKey: "dashboard.modules.pcosStatus.title",
    descriptionKey: "dashboard.modules.pcosStatus.description",
    icon: HeartPulse,
  },
  {
    href: "/dashboard/profile",
    titleKey: "dashboard.modules.healthProfile.title",
    descriptionKey: "dashboard.modules.healthProfile.description",
    icon: User,
  },
  {
    href: "/dashboard/reminders",
    titleKey: "dashboard.modules.reminders.title",
    descriptionKey: "dashboard.modules.reminders.description",
    icon: Bell,
  },
  {
    href: "/dashboard/ai-assistant",
    titleKey: "dashboard.modules.aiAssistant.title",
    descriptionKey: "dashboard.modules.aiAssistant.description",
    icon: Sparkles,
  },
  {
    href: "/dashboard/forum",
    titleKey: "dashboard.modules.forum.title",
    descriptionKey: "dashboard.modules.forum.description",
    icon: MessageSquare,
  },
]

export function DashboardHomeView() {
  const { user, healthProfile } = useAuth()
  const { t } = useLanguage()

  const languageLabel =
    user?.language_preference === "tamil"
      ? t("common.tamil")
      : t("common.english")

  return (
    <div>
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.welcome", {
          name: user?.full_name ?? t("dashboard.welcomeFallbackName"),
        })}
        description={t("dashboard.description")}
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <HeartPulse className="size-5 text-primary" />
          <p className="mt-3 font-heading text-3xl font-bold">
            {healthProfile?.calculated_bmi?.toFixed(1) ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.stats.currentBmi")}
          </p>
        </div>
        <div className="stat-card">
          <Badge variant="secondary" className="mb-2 rounded-full">
            {languageLabel}
          </Badge>
          <p className="text-sm font-semibold">
            {t("dashboard.stats.languagePreference")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.stats.languageReady")}
          </p>
        </div>
        <div className="stat-card border-primary/20 bg-gradient-to-br from-primary/8 to-[var(--brand-soft)]/10">
          <Sparkles className="size-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">
            {t("dashboard.stats.aiInsights")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.stats.aiInsightsHint")}
          </p>
        </div>
      </div>

      <p className="section-eyebrow mb-4">{t("dashboard.yourModules")}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href} className="group bento-card block">
              <div className="flex items-start justify-between gap-3">
                <div className="bento-icon">
                  <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                {t(module.titleKey)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(module.descriptionKey)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
