"use client"

import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { CycleWheel } from "@/components/cycle/cycle-wheel"
import { FadeIn, MotionCard } from "@/components/motion-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useDashboardSummary } from "@/hooks/use-queries"
import { useLanguage } from "@/providers/language-provider"

const moreModules = [
  { href: "/dashboard/symptoms", titleKey: "dashboard.modules.symptoms.title", icon: Activity },
  { href: "/dashboard/pcos-status", titleKey: "dashboard.modules.pcosStatus.title", icon: HeartPulse },
  { href: "/dashboard/reminders", titleKey: "dashboard.modules.reminders.title", icon: Bell },
  { href: "/dashboard/ai-assistant", titleKey: "dashboard.modules.aiAssistant.title", icon: Sparkles },
  { href: "/dashboard/forum", titleKey: "dashboard.modules.forum.title", icon: MessageSquare },
  { href: "/dashboard/profile", titleKey: "dashboard.modules.healthProfile.title", icon: User },
]

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  })
}

function formatTodayLabel(locale: string) {
  const date = new Date()
  const formatted = date.toLocaleDateString(locale === "ta" ? "ta-IN" : "en-CA")
  return formatted
}

function cycleStatusLabel(
  daysUntil: number | null | undefined,
  t: (key: string, params?: Record<string, string>) => string,
) {
  if (daysUntil == null) return t("dashboard.description")
  if (daysUntil <= 0) return t("dashboard.cycleWheel.periodStartingToday")
  if (daysUntil === 1) return t("dashboard.cycleWheel.daysUntilPeriodOne")
  return t("dashboard.cycleWheel.daysUntilPeriod", { days: String(daysUntil) })
}

function phaseLabel(
  phase: string | null | undefined,
  t: (key: string) => string,
) {
  if (!phase) return undefined
  const key = `dashboard.phases.${phase}`
  const label = t(key)
  return label === key ? undefined : label
}

export function DashboardHomeView() {
  const { t, locale } = useLanguage()
  const { data: summary, isLoading, isError, error } = useDashboardSummary()

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  const insights = summary?.cycle_insights

  return (
    <div>
      <FadeIn>
        {isLoading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : insights?.has_data ? (
          <>
            <MotionCard delay={0.05}>
              <div className="clue-cycle-panel mb-8 overflow-hidden rounded-3xl px-4 py-8 md:px-8 md:py-10">
                <div className="mb-6 text-center">
                  <p className="text-lg font-semibold text-white">{t("dashboard.cycleWheel.tagline")}</p>
                  <p className="text-sm text-[#f98fcd]">{t("dashboard.cycleWheel.subtitle")}</p>
                </div>

                <CycleWheel
                  insights={insights}
                  todayLabel={t("dashboard.cycleWheel.today", { date: formatTodayLabel(locale) })}
                  statusLabel={cycleStatusLabel(insights.days_until_next_period, t)}
                  phaseLabel={phaseLabel(insights.current_phase, t)}
                  dayMarkerLabel={t("dashboard.cycleWheel.dayMarker", {
                    day: String(insights.cycle_day ?? 1),
                  })}
                />

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button className="rounded-full bg-[#f429a0] hover:bg-[#f54baf]" render={<Link href="/dashboard/cycle" />}>
                    <CalendarDays className="size-4" />
                    {t("dashboard.actions.logPeriod")}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    render={<Link href="/dashboard/daily-log" />}
                  >
                    <ClipboardList className="size-4" />
                    {t("dashboard.actions.dailyLog")}
                  </Button>
                </div>
              </div>
            </MotionCard>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <InsightCard
                title={t("dashboard.cards.nextPeriod")}
                value={formatDate(insights.next_period_date, locale)}
                hint={t("dashboard.cards.daysUntil", { days: String(insights.days_until_next_period ?? "—") })}
              />
              <InsightCard
                title={t("dashboard.cards.ovulation")}
                value={formatDate(insights.ovulation_date, locale)}
                hint={t("dashboard.cards.ovulationHint")}
              />
              <InsightCard
                title={t("dashboard.cards.fertileWindow")}
                value={`${formatDate(insights.fertile_window_start, locale)} – ${formatDate(insights.fertile_window_end, locale)}`}
                hint={t("dashboard.cards.fertileHint")}
              />
              <InsightCard
                title={t("dashboard.cards.follicularPhase")}
                value={`${formatDate(insights.follicular_start_date, locale)} – ${formatDate(insights.follicular_end_date, locale)}`}
                hint={t("dashboard.cards.follicularHint")}
              />
              <InsightCard
                title={t("dashboard.cards.lutealPhase")}
                value={`${formatDate(insights.luteal_start_date, locale)} – ${formatDate(insights.luteal_end_date, locale)}`}
                hint={t("dashboard.cards.lutealHint")}
              />
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2">
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
                  <Button variant="outline" size="sm" className="rounded-full" render={<Link href="/dashboard/daily-log" />}>
                    {t("dashboard.actions.dailyLog")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("dashboard.widgets.healthTip")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{t(summary?.health_tip_key ?? "dashboard.tips.default")}</p>
                  {summary?.upcoming_reminders?.length ? (
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("dashboard.widgets.reminders")}
                      </p>
                      {summary.upcoming_reminders.slice(0, 2).map((reminder) => (
                        <p key={reminder.id} className="text-foreground">
                          {reminder.item_name} · {reminder.scheduled_time}
                        </p>
                      ))}
                    </div>
                  ) : null}
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
            <CardContent className="flex flex-col items-start gap-4 py-10">
              <p className="max-w-md text-muted-foreground">{t("dashboard.noCycleData")}</p>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full" render={<Link href="/dashboard/cycle" />}>
                  {t("dashboard.actions.logPeriod")}
                </Button>
                <Button variant="outline" className="rounded-full" render={<Link href="/dashboard/daily-log" />}>
                  {t("dashboard.actions.dailyLog")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {(summary?.quick_actions ?? []).length > 0 ? (
          <>
            <p className="section-eyebrow mb-3">{t("dashboard.quickActions")}</p>
            <div className="mb-10 flex flex-wrap gap-3">
              {summary!.quick_actions.map((action) => (
                <Button key={action.href} variant="outline" className="rounded-full" render={<Link href={action.href} />}>
                  {t(action.label_key)}
                </Button>
              ))}
            </div>
          </>
        ) : null}

        <p className="section-eyebrow mb-4">{t("dashboard.yourModules")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moreModules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.href} href={module.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{t(module.titleKey)}</span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:text-primary" />
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
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
