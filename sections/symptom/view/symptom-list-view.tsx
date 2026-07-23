"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
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

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { useSymptomsData } from "@/hooks/use-queries"
import { useLanguage } from "@/providers/language-provider"
import {
  createSymptom,
} from "@/services/symptom"
import type { SymptomTrackingLog } from "@/types/symptom-tracking-log"

function buildSchema(t: (key: string) => string) {
  return z.object({
    category: z.string().min(1, t("symptoms.validation.categoryRequired")),
    painSeverity: z.number().min(0).max(10),
    moodStatus: z.string().optional(),
    sleepMetrics: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function SymptomListView() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useSymptomsData()

  function translateApiMessage(code: string, fallback?: string | null) {
    const key = `api.messages.${code}`
    const translated = t(key)
    return translated === key ? (fallback ?? key) : translated
  }

  const symptoms = data?.symptoms ?? []
  const trends = data?.trends ?? null

  const schema = React.useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { painSeverity: 3 },
  })

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  async function onSubmit(values: FormValues) {
    try {
      const result = await createSymptom({
        category: values.category,
        pain_severity: values.painSeverity,
        mood_status: values.moodStatus || null,
        sleep_metrics: values.sleepMetrics || null,
      })
      toast.success(t("symptoms.toast.logged"))
      if (result.ai_flag) {
        toast.info(
          result.ai_flag_code
            ? translateApiMessage(result.ai_flag_code, result.ai_flag)
            : result.ai_flag,
        )
      }
      reset({ painSeverity: 3 })
      await queryClient.invalidateQueries({ queryKey: queryKeys.symptoms.list })
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <PageHeader
        title={t("symptoms.title")}
        description={t("symptoms.description")}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("symptoms.charts.painTrendTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {trends?.date_trends.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.date_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avg_pain"
                    name={t("symptoms.charts.avgPainLabel")}
                    stroke="hsl(var(--primary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("symptoms.charts.painTrendEmpty")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("symptoms.charts.categoryTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {trends?.category_trends.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.category_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name={t("symptoms.charts.countLabel")}
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("symptoms.charts.categoryEmpty")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("symptoms.form.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>{t("symptoms.form.category")}</Label>
              <Input
                placeholder={t("symptoms.form.categoryPlaceholder")}
                {...register("category")}
              />
              {errors.category ? (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("symptoms.form.painSeverity")}</Label>
              <Input
                type="number"
                min={0}
                max={10}
                {...register("painSeverity", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("symptoms.form.mood")}</Label>
              <Input
                placeholder={t("symptoms.form.moodPlaceholder")}
                {...register("moodStatus")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("symptoms.form.sleep")}</Label>
              <Input
                placeholder={t("symptoms.form.sleepPlaceholder")}
                {...register("sleepMetrics")}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("symptoms.form.submitting")
                  : t("symptoms.form.submit")}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("symptoms.table.title", { count: trends?.total_entries ?? 0 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("symptoms.table.date")}</TableHead>
                  <TableHead>{t("symptoms.table.category")}</TableHead>
                  <TableHead>{t("symptoms.table.pain")}</TableHead>
                  <TableHead>{t("symptoms.table.mood")}</TableHead>
                  <TableHead>{t("symptoms.table.sleep")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symptoms.map((symptom) => (
                  <TableRow key={symptom.id}>
                    <TableCell>{symptom.date_time?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{symptom.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {t("symptoms.table.painValue", {
                        value: symptom.pain_severity,
                      })}
                    </TableCell>
                    <TableCell>{symptom.mood_status ?? "—"}</TableCell>
                    <TableCell>{symptom.sleep_metrics ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
