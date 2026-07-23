"use client"

import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Droplets,
  HeartPulse,
  LineChart,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { CycleWheel } from "@/components/cycle/cycle-wheel"
import { FadeIn, MotionCard } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useDashboardSummary } from "@/hooks/use-queries"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import type { CyclePhase } from "@/types/cycle-history-log"

const modules = [
  { href: "/dashboard/cycle", titleKey: "dashboard.modules.cycleTracking.title", descriptionKey: "dashboard.modules.cycleTracking.description", icon: CalendarDays },
  { href: "/dashboard/insights", titleKey: "dashboard.modules.insights.title", descriptionKey: "dashboard.modules.insights.description", icon: LineChart },
  { href: "/dashboard/symptoms", titleKey: "dashboard.modules.symptoms.title", descriptionKey: "dashboard.modules.symptoms.description", icon: Activity },
  { href: "/dashboard/pcos-status", titleKey: "dashboard.modules.pcosStatus.title", descriptionKey: "dashboard.modules.pcosStatus.description", icon: HeartPulse },
  { href: "/dashboard/profile", titleKey: "dashboard.modules.healthProfile.title", descriptionKey: "dashboard.modules.healthProfile.description", icon: User },
  { href: "/dashboard/reminders", titleKey: "dashboard.modules.reminders.title", descriptionKey: "dashboard.modules.reminders.description", icon: Bell },
  { href: "/dashboard/ai-assistant", titleKey: "dashboard.modules.aiAssistant.title", descriptionKey: "dashboard.modules.aiAssistant.description", icon: Sparkles },
  { href: "/dashboard/forum", titleKey: "dashboard.modules.forum.title", descriptionKey: "dashboard.modules.forum.description", icon: MessageSquare },
]

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  })
}

function phaseLabelKey(phase: CyclePhase | null | undefined) {
  return phase ? `dashboard.phases.${phase}` : "dashboard.phases.unknown"
}

export function DashboardHomeView() {
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const { data: summary, isLoading, isError, error } = useDashboardSummary()
  const [waterGlasses, setWaterGlasses] = React.useState(0)

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  const insights = summary?.cycle_insights
  const waterGoal = summary?.water_intake_goal_liters ?? 2
  const waterProgress = Math.min(waterGlasses * 0.25, waterGoal)

  return (
    <div>
      <FadeIn>
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.welcome", { name: user?.full_name ?? t("dashboard.welcomeFallbackName") })}
        description={t("dashboard.description")}
      />

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : insights?.has_data ? (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            <MotionCard delay={0.05}>
            <Card className="glass-panel rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="font-heading text-lg">{t("dashboard.cycleWheel.title")}</CardTitle>
                <CardDescription>{t("dashboard.cycleWheel.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <CycleWheel
                  insights={insights}
                  phaseLabel={t(phaseLabelKey(insights.current_phase))}
                  cycleDayLabel={t("dashboard.cycleWheel.cycleDay")}
                />
              </CardContent>
            </Card>
            </MotionCard>

            <div className="grid gap-4 sm:grid-cols-2">
              <InsightCard title={t("dashboard.cards.nextPeriod")} value={formatDate(insights.next_period_date, locale)} hint={t("dashboard.cards.daysUntil", { days: String(insights.days_until_next_period ?? "—") })} />
              <InsightCard title={t("dashboard.cards.ovulation")} value={formatDate(insights.ovulation_date, locale)} hint={t("dashboard.cards.ovulationHint")} />
              <InsightCard title={t("dashboard.cards.fertileWindow")} value={`${formatDate(insights.fertile_window_start, locale)} – ${formatDate(insights.fertile_window_end, locale)}`} hint={t("dashboard.cards.fertileHint")} />
              <InsightCard title={t("dashboard.cards.pmsWindow")} value={`${formatDate(insights.pms_window_start, locale)} – ${formatDate(insights.pms_window_end, locale)}`} hint={t("dashboard.cards.pmsHint")} />
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.widgets.todaySymptoms")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {summary?.today_symptoms?.length ? (
                  summary.today_symptoms.map((symptom) => (
                    <div key={symptom.id} className="rounded-xl bg-muted/50 px-3 py-2">
                      <p className="font-medium">{symptom.category}</p>
                      <p className="text-muted-foreground">
                        {t("dashboard.widgets.pain")}: {symptom.pain_severity}/10
                        {symptom.mood_status ? ` · ${symptom.mood_status}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{t("dashboard.widgets.noSymptomsToday")}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" render={<Link href="/dashboard/daily-log" />}>
                    {t("dashboard.actions.dailyLog")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" render={<Link href="/dashboard/insights" />}>
                    {t("dashboard.actions.viewInsights")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" render={<Link href="/dashboard/symptoms" />}>
                    {t("dashboard.actions.logSymptom")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.widgets.water")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <Droplets className="size-5 text-primary" />
                  <span className="font-heading text-2xl font-bold">{waterProgress.toFixed(1)}L</span>
                  <span className="text-sm text-muted-foreground">/ {waterGoal}L</span>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (waterProgress / waterGoal) * 100)}%` }} />
                </div>
                <Button size="sm" className="rounded-full" onClick={() => setWaterGlasses((n) => n + 1)}>
                  {t("dashboard.widgets.addWater")}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.widgets.reminders")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {summary?.upcoming_reminders?.length ? (
                  summary.upcoming_reminders.map((reminder) => (
                    <div key={reminder.id} className="rounded-xl bg-muted/50 px-3 py-2">
                      <p className="font-medium">{reminder.item_name}</p>
                      <p className="text-muted-foreground">{reminder.scheduled_time}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{t("dashboard.widgets.noReminders")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-[var(--brand-soft)]/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.widgets.healthTip")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t(summary?.health_tip_key ?? "dashboard.tips.default")}
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("dashboard.stats.avgCycle")} value={String(insights.statistics.average_cycle_length ?? "—")} />
            <StatCard label={t("dashboard.stats.avgPeriod")} value={String(insights.statistics.average_period_length ?? "—")} />
            <StatCard label={t("dashboard.stats.longestCycle")} value={String(insights.statistics.longest_cycle ?? "—")} />
            <StatCard label={t("dashboard.stats.shortestCycle")} value={String(insights.statistics.shortest_cycle ?? "—")} />
          </div>
        </>
      ) : (
        <Card className="mb-8 rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <p className="text-muted-foreground">{t("dashboard.noCycleData")}</p>
            <Button className="rounded-full" render={<Link href="/dashboard/cycle" />}>
              {t("dashboard.actions.logPeriod")}
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="section-eyebrow mb-3">{t("dashboard.quickActions")}</p>
      <div className="mb-10 flex flex-wrap gap-3">
        {(summary?.quick_actions ?? []).map((action) => (
          <Button key={action.href} variant="outline" className="rounded-full" render={<Link href={action.href} />}>
            {t(action.label_key)}
          </Button>
        ))}
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
              <h3 className="mt-4 font-heading text-lg font-semibold">{t(module.titleKey)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(module.descriptionKey)}</p>
            </Link>
          )
        })}
      </div>
      </FadeIn>
    </div>
  )
}

function InsightCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <p className="font-heading text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
