"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getMyDailyLogs, upsertDailyLog } from "@/services/daily-log"
import type { DailyLog } from "@/types/daily-log"

function optionalNumber() {
  return z.number().optional()
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    logDate: z.string().min(1, t("dailyLog.validation.dateRequired")),
    flowLevel: z.enum(["none", "spotting", "light", "medium", "heavy"]),
    painLevel: z.enum(["none", "mild", "moderate", "severe"]),
    mood: z.string().optional(),
    energy: z.enum(["low", "medium", "high"]).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    exercise: z.enum(["none", "light", "moderate", "intense"]).optional(),
    weight: optionalNumber(),
    basalTemp: optionalNumber(),
    cervicalFluid: z.enum(["dry", "sticky", "creamy", "egg_white"]).optional(),
    sexualActivity: z.boolean(),
    notes: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function DailyLogView() {
  const { t } = useLanguage()
  const [logs, setLogs] = React.useState<DailyLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const schema = React.useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      logDate: new Date().toISOString().slice(0, 10),
      flowLevel: "none",
      painLevel: "none",
      sexualActivity: false,
    },
  })

  async function loadLogs() {
    try {
      const data = await getMyDailyLogs()
      setLogs(data.daily_logs)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadLogs()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      await upsertDailyLog({
        log_date: values.logDate,
        flow_level: values.flowLevel,
        pain_level: values.painLevel,
        mood: values.mood || null,
        energy: values.energy || null,
        sleep_hours: values.sleepHours ?? null,
        exercise: values.exercise || null,
        weight: values.weight ?? null,
        basal_temp: values.basalTemp ?? null,
        cervical_fluid: values.cervicalFluid || null,
        sexual_activity: values.sexualActivity,
        notes: values.notes || null,
      })
      toast.success(t("dailyLog.toast.saved"))
      reset({
        logDate: new Date().toISOString().slice(0, 10),
        flowLevel: "none",
        painLevel: "none",
        sexualActivity: false,
      })
      await loadLogs()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <PageHeader title={t("dailyLog.title")} description={t("dailyLog.description")} />

      <Card className="mb-6 rounded-3xl">
        <CardHeader>
          <CardTitle>{t("dailyLog.form.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t("dailyLog.fields.date")} error={errors.logDate?.message}>
              <Input type="date" {...register("logDate")} />
            </Field>
            <Field label={t("dailyLog.fields.flow")}>
              <Select {...register("flowLevel")}>
                {(["none", "spotting", "light", "medium", "heavy"] as const).map((v) => (
                  <option key={v} value={v}>{t(`dailyLog.flow.${v}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("dailyLog.fields.pain")}>
              <Select {...register("painLevel")}>
                {(["none", "mild", "moderate", "severe"] as const).map((v) => (
                  <option key={v} value={v}>{t(`dailyLog.pain.${v}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("dailyLog.fields.mood")}>
              <Input {...register("mood")} />
            </Field>
            <Field label={t("dailyLog.fields.energy")}>
              <Select {...register("energy")}>
                {(["low", "medium", "high"] as const).map((v) => (
                  <option key={v} value={v}>{t(`dailyLog.energy.${v}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("dailyLog.fields.sleep")}>
              <Input
                type="number"
                step="0.5"
                {...register("sleepHours", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </Field>
            <Field label={t("dailyLog.fields.exercise")}>
              <Select {...register("exercise")}>
                {(["none", "light", "moderate", "intense"] as const).map((v) => (
                  <option key={v} value={v}>{t(`dailyLog.exercise.${v}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("dailyLog.fields.weight")}>
              <Input
                type="number"
                step="0.1"
                {...register("weight", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </Field>
            <Field label={t("dailyLog.fields.basalTemp")}>
              <Input
                type="number"
                step="0.01"
                {...register("basalTemp", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </Field>
            <Field label={t("dailyLog.fields.discharge")}>
              <Select {...register("cervicalFluid")}>
                {(["dry", "sticky", "creamy", "egg_white"] as const).map((v) => (
                  <option key={v} value={v}>{t(`dailyLog.discharge.${v}`)}</option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" {...register("sexualActivity")} />
              {t("dailyLog.fields.sexualActivity")}
            </label>
            <Field label={t("dailyLog.fields.notes")}>
              <Textarea rows={3} className="md:col-span-2" {...register("notes")} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="rounded-full md:col-span-2">
              {isSubmitting ? t("dailyLog.form.submitting") : t("dailyLog.form.submit")}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("dailyLog.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : logs.length ? (
            logs.slice(0, 14).map((log) => (
              <div key={log.id} className="rounded-xl border border-border/60 px-4 py-3 text-sm">
                <p className="font-medium">{log.log_date}</p>
                <p className="text-muted-foreground">
                  {t(`dailyLog.flow.${log.flow_level ?? "none"}`)} · {t(`dailyLog.pain.${log.pain_level ?? "none"}`)}
                  {log.mood ? ` · ${log.mood}` : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">{t("dailyLog.recent.empty")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
