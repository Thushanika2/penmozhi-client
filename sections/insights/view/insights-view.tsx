"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
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

const PAIN_LEVELS = ["none", "mild", "moderate", "severe"] as const
const ENERGY_LEVELS = ["", "low", "medium", "high"] as const

type Translate = (key: string, params?: Record<string, string>) => string

function formatShortDate(value: string, locale: string) {
  if (!value || value === "unknown") return "—"
  return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  })
}

function daysLabel(value: number | null | undefined, t: Translate) {
  if (value == null) return "—"
  return t("insights.units.daysValue", { value: String(value) })
}

function localizeLookup(raw: string | null | undefined, prefix: string, t: Translate) {
  if (!raw) return "—"
  const key = `${prefix}.${raw.toLowerCase().replace(/\s+/g, "_")}`
  const translated = t(key)
  if (translated !== key) return translated
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function painTick(value: number, t: Translate) {
  const level = PAIN_LEVELS[Math.round(value)]
  return level ? t(`dailyLog.pain.${level}`) : String(value)
}

function energyTick(value: number, t: Translate) {
  const level = ENERGY_LEVELS[Math.round(value)]
  return level ? t(`dailyLog.energy.${level}`) : String(value)
}

function symptomPainWord(value: number, t: Translate) {
  if (value <= 2) return t("dailyLog.pain.none")
  if (value <= 4) return t("dailyLog.pain.mild")
  if (value <= 7) return t("dailyLog.pain.moderate")
  return t("dailyLog.pain.severe")
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number | string; payload?: Record<string, unknown> }>
  label?: string
  valueFormatter: (value: number, row?: Record<string, unknown>) => string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const numeric = typeof row.value === "number" ? row.value : Number(row.value)
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">
        {row.name}:{" "}
        <span className="font-semibold text-foreground">
          {Number.isFinite(numeric) ? valueFormatter(numeric, row.payload) : String(row.value)}
        </span>
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  description,
  empty,
  hasData,
  unitHint,
  children,
}: {
  title: string
  description?: string
  empty: string
  hasData: boolean
  unitHint?: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {unitHint && hasData ? (
          <p className="text-xs font-medium text-primary/80">{unitHint}</p>
        ) : null}
      </CardHeader>
      <CardContent className="h-72">
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
  const avgCycle = stats?.average_cycle_length ?? null
  const topMood = insights?.mood_frequency?.[0]?.mood
  const topSymptom = insights?.symptom_trends?.category_trends?.[0]?.category

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
  const symptomCategoryData =
    insights?.symptom_trends.category_trends.map((point) => ({
      ...point,
      categoryLabel: localizeLookup(point.category, "onboarding.symptoms", t),
    })) ?? []
  const dailyPainData =
    insights?.daily_pain_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
      levelLabel: localizeLookup(point.level, "dailyLog.pain", t),
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
      levelLabel: localizeLookup(point.level, "dailyLog.energy", t),
    })) ?? []
  const moodFrequencyData =
    insights?.mood_frequency.map((point) => ({
      ...point,
      moodLabel: localizeLookup(point.mood, "insights.moods", t),
    })) ?? []
  const moodTimelineData =
    insights?.mood_timeline.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
      moodLabel: localizeLookup(point.primary_mood, "insights.moods", t),
    })) ?? []

  const summaryParts: string[] = []
  if (avgCycle != null) {
    summaryParts.push(
      t("insights.summary.avgCycle", {
        days: String(avgCycle),
        months: String(months),
      }),
    )
  }
  if (topMood) {
    summaryParts.push(
      t("insights.summary.topMood", {
        mood: localizeLookup(topMood, "insights.moods", t),
      }),
    )
  }
  if (topSymptom) {
    summaryParts.push(
      t("insights.summary.topSymptom", {
        symptom: localizeLookup(topSymptom, "onboarding.symptoms", t),
      }),
    )
  }
  if (insights?.total_daily_logs) {
    summaryParts.push(
      t("insights.summary.logsCount", {
        count: String(insights.total_daily_logs),
      }),
    )
  }

  return (
    <div>
      <FadeIn>
        <PageHeader
          title={t("insights.title")}
          description={t("insights.description")}
          action={
            <Select
              value={String(months)}
              onChange={(event) =>
                setMonths(Number(event.target.value) as (typeof RANGE_OPTIONS)[number])
              }
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
            {summaryParts.length > 0 ? (
              <Card className="rounded-3xl border-primary/20 bg-primary/5">
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm font-semibold text-foreground">
                    {t("insights.summary.title")}
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {summaryParts.map((part) => (
                      <li key={part} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{part}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl border-dashed">
                <CardContent className="p-5 text-sm text-muted-foreground">
                  {t("insights.summary.empty")}
                </CardContent>
              </Card>
            )}

            <section>
              <h2 className="mb-4 text-lg font-semibold">{t("insights.sections.cycleStats")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label={t("insights.stats.avgCycle")}
                  value={daysLabel(stats?.average_cycle_length, t)}
                  hint={t("insights.stats.avgCycleHint")}
                />
                <StatCard
                  label={t("insights.stats.avgPeriod")}
                  value={daysLabel(stats?.average_period_length, t)}
                  hint={t("insights.stats.avgPeriodHint")}
                />
                <StatCard
                  label={t("insights.stats.longestCycle")}
                  value={daysLabel(stats?.longest_cycle, t)}
                />
                <StatCard
                  label={t("insights.stats.shortestCycle")}
                  value={daysLabel(stats?.shortest_cycle, t)}
                />
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title={t("insights.charts.cycleLength.title")}
                description={t("insights.charts.cycleLength.description")}
                empty={t("insights.charts.cycleLength.empty")}
                hasData={cycleTrendData.length > 0}
                unitHint={t("insights.charts.cycleLength.unitHint")}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      width={40}
                      label={{
                        value: t("insights.units.days"),
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                      }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          valueFormatter={(value) =>
                            t("insights.units.daysValue", { value: String(value) })
                          }
                        />
                      }
                    />
                    <ReferenceArea
                      y1={21}
                      y2={35}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.08}
                      ifOverflow="extendDomain"
                    />
                    {avgCycle != null ? (
                      <ReferenceLine
                        y={avgCycle}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="4 4"
                        label={{
                          value: t("insights.charts.cycleLength.averageLine", {
                            days: String(avgCycle),
                          }),
                          position: "insideTopRight",
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                      />
                    ) : null}
                    <Line
                      type="monotone"
                      dataKey="cycle_length"
                      name={t("insights.charts.cycleLength.label")}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={t("insights.charts.periodLength.title")}
                description={t("insights.charts.periodLength.description")}
                empty={t("insights.charts.periodLength.empty")}
                hasData={periodTrendData.length > 0}
                unitHint={t("insights.charts.periodLength.unitHint")}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      width={40}
                      label={{
                        value: t("insights.units.days"),
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                      }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          valueFormatter={(value) =>
                            t("insights.units.daysValue", { value: String(value) })
                          }
                        />
                      }
                    />
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
                  description={t("insights.charts.symptomPain.description")}
                  empty={t("insights.charts.symptomPain.empty")}
                  hasData={symptomPainData.length > 0}
                  unitHint={t("insights.charts.symptomPain.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={symptomPainData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={36} />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(value) =>
                              `${value}/10 · ${symptomPainWord(value, t)}`
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_pain"
                        name={t("insights.charts.symptomPain.label")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title={t("insights.charts.symptomCategory.title")}
                  description={t("insights.charts.symptomCategory.description")}
                  empty={t("insights.charts.symptomCategory.empty")}
                  hasData={symptomCategoryData.length > 0}
                  unitHint={t("insights.charts.symptomCategory.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={symptomCategoryData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="categoryLabel" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        width={36}
                        label={{
                          value: t("insights.units.entries"),
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                        }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(value) =>
                              t("insights.units.entriesValue", { value: String(value) })
                            }
                          />
                        }
                      />
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
                  description={t("insights.charts.dailyPain.description")}
                  empty={t("insights.charts.dailyPain.empty")}
                  hasData={dailyPainData.length > 0}
                  unitHint={t("insights.charts.dailyPain.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyPainData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[0, 1, 2, 3]}
                        tickFormatter={(value) => painTick(Number(value), t)}
                        tick={{ fontSize: 10 }}
                        width={72}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(_value, row) =>
                              String(row?.levelLabel ?? painTick(Number(_value), t))
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name={t("insights.charts.dailyPain.label")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title={t("insights.charts.sleep.title")}
                  description={t("insights.charts.sleep.description")}
                  empty={t("insights.charts.sleep.empty")}
                  hasData={sleepData.length > 0}
                  unitHint={t("insights.charts.sleep.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sleepData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={[0, 12]}
                        tick={{ fontSize: 11 }}
                        width={40}
                        label={{
                          value: t("insights.units.hours"),
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                        }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(value) =>
                              t("insights.units.hoursValue", { value: String(value) })
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        name={t("insights.charts.sleep.label")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title={t("insights.charts.energy.title")}
                  description={t("insights.charts.energy.description")}
                  empty={t("insights.charts.energy.empty")}
                  hasData={energyData.length > 0}
                  unitHint={t("insights.charts.energy.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energyData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={[1, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(value) => energyTick(Number(value), t)}
                        tick={{ fontSize: 10 }}
                        width={72}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(_value, row) =>
                              String(row?.levelLabel ?? energyTick(Number(_value), t))
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name={t("insights.charts.energy.label")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
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
                  description={t("insights.charts.moodFrequency.description")}
                  empty={t("insights.charts.moodFrequency.empty")}
                  hasData={moodFrequencyData.length > 0}
                  unitHint={t("insights.charts.moodFrequency.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={moodFrequencyData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="moodLabel"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        width={36}
                        label={{
                          value: t("insights.units.entries"),
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                        }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(value) =>
                              t("insights.units.entriesValue", { value: String(value) })
                            }
                          />
                        }
                      />
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
                  description={t("insights.charts.moodTimeline.description")}
                  empty={t("insights.charts.moodTimeline.empty")}
                  hasData={moodTimelineData.length > 0}
                  unitHint={t("insights.charts.moodTimeline.unitHint")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodTimelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                      <Tooltip
                        content={
                          <ChartTooltip
                            valueFormatter={(value, row) =>
                              t("insights.charts.moodTimeline.tooltip", {
                                count: String(value),
                                mood: String(row?.moodLabel ?? "—"),
                              })
                            }
                          />
                        }
                      />
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
