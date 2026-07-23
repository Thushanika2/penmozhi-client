"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { FadeIn } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useHealthInsights } from "@/hooks/use-queries"
import { useLanguage } from "@/providers/language-provider"

const RANGE_OPTIONS = [3, 6, 12] as const

function formatShortDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  })
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  description,
  empty,
  hasData,
  children,
}: {
  title: string
  description?: string
  empty: string
  hasData: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
      </CardContent>
    </Card>
  )
}

export function InsightsView() {
  const { t, locale } = useLanguage()
  const [months, setMonths] = React.useState<(typeof RANGE_OPTIONS)[number]>(6)
  const { data: insights, isLoading, isError, error } = useHealthInsights(months)

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  const stats = insights?.cycle_statistics
  const cycleTrendData =
    insights?.cycle_length_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.start_date, locale),
    })) ?? []
  const periodTrendData =
    insights?.period_length_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.start_date, locale),
    })) ?? []
  const symptomPainData =
    insights?.symptom_trends.date_trends.map((point) => ({
      ...point,
      label: formatShortDate(point.date ?? "", locale),
    })) ?? []
  const dailyPainData =
    insights?.daily_pain_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []
  const sleepData =
    insights?.sleep_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []
  const energyData =
    insights?.energy_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []
  const moodTimelineData =
    insights?.mood_timeline.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []

  return (
    <div>
      <FadeIn>
      <PageHeader
        title={t("insights.title")}
        description={t("insights.description")}
        action={
          <Select
            value={String(months)}
            onChange={(event) => setMonths(Number(event.target.value) as (typeof RANGE_OPTIONS)[number])}
            className="w-40 rounded-full"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t("insights.range.months", { count: String(option) })}
              </option>
            ))}
          </Select>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">{t("insights.sections.cycleStats")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t("insights.stats.avgCycle")}
                value={String(stats?.average_cycle_length ?? "—")}
              />
              <StatCard
                label={t("insights.stats.avgPeriod")}
                value={String(stats?.average_period_length ?? "—")}
              />
              <StatCard
                label={t("insights.stats.longestCycle")}
                value={String(stats?.longest_cycle ?? "—")}
              />
              <StatCard
                label={t("insights.stats.shortestCycle")}
                value={String(stats?.shortest_cycle ?? "—")}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title={t("insights.charts.cycleLength.title")}
              description={t("insights.charts.cycleLength.description")}
              empty={t("insights.charts.cycleLength.empty")}
              hasData={cycleTrendData.length > 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cycle_length"
                    name={t("insights.charts.cycleLength.label")}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title={t("insights.charts.periodLength.title")}
              description={t("insights.charts.periodLength.description")}
              empty={t("insights.charts.periodLength.empty")}
              hasData={periodTrendData.length > 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="period_length"
                    name={t("insights.charts.periodLength.label")}
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">{t("insights.sections.symptoms")}</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title={t("insights.charts.symptomPain.title")}
                empty={t("insights.charts.symptomPain.empty")}
                hasData={symptomPainData.length > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={symptomPainData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avg_pain"
                      name={t("insights.charts.symptomPain.label")}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={t("insights.charts.symptomCategory.title")}
                empty={t("insights.charts.symptomCategory.empty")}
                hasData={(insights?.symptom_trends.category_trends.length ?? 0) > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights?.symptom_trends.category_trends ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name={t("insights.charts.symptomCategory.label")}
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">{t("insights.sections.dailyLogs")}</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title={t("insights.charts.dailyPain.title")}
                empty={t("insights.charts.dailyPain.empty")}
                hasData={dailyPainData.length > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyPainData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 3]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name={t("insights.charts.dailyPain.label")}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={t("insights.charts.sleep.title")}
                empty={t("insights.charts.sleep.empty")}
                hasData={sleepData.length > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name={t("insights.charts.sleep.label")}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={t("insights.charts.energy.title")}
                empty={t("insights.charts.energy.empty")}
                hasData={energyData.length > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 3]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name={t("insights.charts.energy.label")}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">{t("insights.sections.mood")}</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title={t("insights.charts.moodFrequency.title")}
                empty={t("insights.charts.moodFrequency.empty")}
                hasData={(insights?.mood_frequency.length ?? 0) > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights?.mood_frequency ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name={t("insights.charts.moodFrequency.label")}
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={t("insights.charts.moodTimeline.title")}
                empty={t("insights.charts.moodTimeline.empty")}
                hasData={moodTimelineData.length > 0}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="entry_count"
                      name={t("insights.charts.moodTimeline.label")}
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </section>
        </div>
      )}
      </FadeIn>
    </div>
  )
}
