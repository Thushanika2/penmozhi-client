"use client"

import Link from "next/link"
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
import {
  Activity,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Download,
  MessageSquare,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { downloadAdminExport, getAdminAnalytics } from "@/services/admin"
import type { AdminAnalytics, AdminExportType } from "@/types/admin"

const EXPORT_TYPES: AdminExportType[] = [
  "summary",
  "users",
  "cycles",
  "symptoms",
  "daily_logs",
]

function formatShortDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  })
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card className="rounded-3xl border-border/60">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardView() {
  const { t, locale } = useLanguage()
  const [analytics, setAnalytics] = React.useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState<AdminExportType | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getAdminAnalytics(30)
        if (!cancelled) setAnalytics(data)
      } catch (error) {
        if (!cancelled) toast.error(getLocalizedApiError(error, t))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [t])

  async function handleExport(type: AdminExportType) {
    setExporting(type)
    try {
      await downloadAdminExport(type)
      toast.success(t("admin.analytics.exportSuccess"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setExporting(null)
    }
  }

  const summary = analytics?.summary
  const registrationData =
    analytics?.registration_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []
  const activityData =
    analytics?.activity_trend.map((point) => ({
      ...point,
      label: formatShortDate(point.date, locale),
    })) ?? []

  return (
    <div>
      <PageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
        action={
          <Button render={<Link href="/admin/users" />} className="rounded-full">
            <Users className="size-4" />
            {t("admin.dashboard.manageUsers")}
          </Button>
        }
      />

      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("admin.analytics.totalUsers")}
              value={summary?.total_users ?? 0}
              icon={<Users className="size-5" />}
            />
            <StatCard
              label={t("admin.analytics.onboardingRate")}
              value={`${summary?.onboarding_rate ?? 0}%`}
              icon={<Activity className="size-5" />}
            />
            <StatCard
              label={t("admin.analytics.activeUsers")}
              value={summary?.recent_active_users ?? 0}
              icon={<CalendarDays className="size-5" />}
            />
            <StatCard
              label={t("admin.analytics.pcosUsers")}
              value={summary?.pcos_users ?? 0}
              icon={<ClipboardList className="size-5" />}
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("admin.analytics.cycles")} value={summary?.cycles ?? 0} icon={<CalendarDays className="size-5" />} />
            <StatCard label={t("admin.analytics.symptoms")} value={summary?.symptoms ?? 0} icon={<Activity className="size-5" />} />
            <StatCard label={t("admin.analytics.dailyLogs")} value={summary?.daily_logs ?? 0} icon={<ClipboardList className="size-5" />} />
            <StatCard label={t("admin.analytics.forumPosts")} value={summary?.forum_posts ?? 0} icon={<MessageSquare className="size-5" />} />
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("admin.analytics.registrationsTitle")}</CardTitle>
                <CardDescription>{t("admin.analytics.registrationsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {registrationData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={registrationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        name={t("admin.analytics.registrationsLabel")}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("admin.analytics.noData")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("admin.analytics.activityTitle")}</CardTitle>
                <CardDescription>{t("admin.analytics.activityDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {activityData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="cycles" name={t("admin.analytics.cycles")} fill="hsl(var(--primary))" />
                      <Bar dataKey="symptoms" name={t("admin.analytics.symptoms")} fill="#c084fc" />
                      <Bar dataKey="daily_logs" name={t("admin.analytics.dailyLogs")} fill="#f472b6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("admin.analytics.noData")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.analytics.languageSplit")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 px-4 py-3">
                <p className="text-sm text-muted-foreground">{t("common.english")}</p>
                <p className="text-xl font-semibold">{summary?.english_users ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 px-4 py-3">
                <p className="text-sm text-muted-foreground">{t("common.tamil")}</p>
                <p className="text-xl font-semibold">{summary?.tamil_users ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.analytics.exportTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.exportDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {EXPORT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="rounded-full"
                  disabled={exporting === type}
                  onClick={() => void handleExport(type)}
                >
                  <Download className="size-4" />
                  {t(`admin.analytics.export.${type}`)}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("admin.dashboard.educationTitle")}</CardTitle>
                <CardDescription>{t("admin.dashboard.educationDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button render={<Link href="/admin/education" />}>
                  <BookOpen className="size-4" />
                  {t("admin.dashboard.manageArticles")}
                </Button>
                <Button variant="outline" render={<Link href="/admin/education/new" />}>
                  {t("admin.dashboard.newArticle")}
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>{t("admin.dashboard.forumTitle")}</CardTitle>
                <CardDescription>{t("admin.dashboard.forumDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button render={<Link href="/admin/forum/moderation" />}>
                  <MessageSquare className="size-4" />
                  {t("admin.dashboard.openModeration")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
