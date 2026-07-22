"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import {
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { createCycle, getMyCycles, predictNextPeriod } from "@/services/cycle"
import type { CycleHistoryLog, CyclePrediction } from "@/types/cycle-history-log"

const FLOW_LABEL_KEYS: Record<string, string> = {
  light: "cycle.flow.light",
  medium: "cycle.flow.medium",
  heavy: "cycle.flow.heavy",
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    cycleStartDate: z.string().min(1, t("cycle.validation.startDateRequired")),
    cycleEndDate: z.string().min(1, t("cycle.validation.endDateRequired")),
    flowIntensity: z.string().min(1, t("cycle.validation.flowIntensityRequired")),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function CycleListView() {
  const { t } = useLanguage()
  function translateApiMessage(code: string, fallback?: string) {
    const key = `api.messages.${code}`
    const translated = t(key)
    return translated === key ? (fallback ?? key) : translated
  }

  const [cycles, setCycles] = React.useState<CycleHistoryLog[]>([])
  const [prediction, setPrediction] = React.useState<CyclePrediction | null>(null)
  const [loading, setLoading] = React.useState(true)

  const schema = React.useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { flowIntensity: "medium" },
  })

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [cyclesData, predictionData] = await Promise.all([
          getMyCycles(),
          predictNextPeriod(),
        ])
        if (cancelled) return
        setCycles(cyclesData.cycles)
        setPrediction(predictionData)
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

  async function loadData() {
    try {
      const [cyclesData, predictionData] = await Promise.all([
        getMyCycles(),
        predictNextPeriod(),
      ])
      setCycles(cyclesData.cycles)
      setPrediction(predictionData)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await createCycle({
        cycle_start_date: values.cycleStartDate,
        cycle_end_date: values.cycleEndDate,
        flow_intensity: values.flowIntensity,
      })
      toast.success(t("cycle.toast.logged"))
      reset({ flowIntensity: "medium" })
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  function flowLabel(value: string) {
    const key = FLOW_LABEL_KEYS[value]
    return key ? t(key) : value
  }

  const chartData = cycles
    .slice()
    .reverse()
    .map((cycle) => ({
      name: cycle.cycle_start_date,
      days:
        (new Date(cycle.cycle_end_date).getTime() -
          new Date(cycle.cycle_start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    }))

  return (
    <div>
      <PageHeader
        title={t("cycle.title")}
        description={t("cycle.description")}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("cycle.prediction.title")}</CardTitle>
            <CardDescription>
              {prediction?.message_code
                ? translateApiMessage(prediction.message_code, prediction?.message)
                : prediction?.message ?? t("cycle.prediction.basedOnHistory")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {prediction?.predicted_next_period_date ?? "—"}
            </p>
            {prediction?.based_on_cycles ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cycle.prediction.basedOnCycles", {
                  count: prediction.based_on_cycles,
                })}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("cycle.trend.title")}</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="days"
                    name={t("cycle.trend.daysLabel")}
                    stroke="hsl(var(--primary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("cycle.trend.empty")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("cycle.form.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("cycle.form.startDate")}</Label>
              <Input type="date" {...register("cycleStartDate")} />
              {errors.cycleStartDate ? (
                <p className="text-sm text-destructive">
                  {errors.cycleStartDate.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("cycle.form.endDate")}</Label>
              <Input type="date" {...register("cycleEndDate")} />
              {errors.cycleEndDate ? (
                <p className="text-sm text-destructive">
                  {errors.cycleEndDate.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("cycle.form.flowIntensity")}</Label>
              <Select {...register("flowIntensity")}>
                <option value="light">{t("cycle.flow.light")}</option>
                <option value="medium">{t("cycle.flow.medium")}</option>
                <option value="heavy">{t("cycle.flow.heavy")}</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("cycle.form.submitting") : t("cycle.form.submit")}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("cycle.history.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cycle.history.start")}</TableHead>
                  <TableHead>{t("cycle.history.end")}</TableHead>
                  <TableHead>{t("cycle.history.flow")}</TableHead>
                  <TableHead>{t("cycle.history.predictedNext")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>{cycle.cycle_start_date}</TableCell>
                    <TableCell>{cycle.cycle_end_date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {flowLabel(cycle.flow_intensity)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cycle.predicted_next_period_date ?? "—"}
                    </TableCell>
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
