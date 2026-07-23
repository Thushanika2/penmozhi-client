"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"

import { CycleCalendar } from "@/components/cycle/cycle-calendar"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { useLanguage } from "@/providers/language-provider"
import { getCycleCalendar } from "@/services/daily-log"
import {
  createCycle,
  deleteCycle,
  getMyCycles,
  predictNextPeriod,
  updateCycle,
} from "@/services/cycle"
import type { CycleHistoryLog } from "@/types/cycle-history-log"

const FLOW_LABEL_KEYS: Record<string, string> = {
  light: "cycle.flow.light",
  medium: "cycle.flow.medium",
  heavy: "cycle.flow.heavy",
  very_heavy: "cycle.flow.veryHeavy",
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    cycleStartDate: z.string().min(1, t("cycle.validation.startDateRequired")),
    cycleEndDate: z.string().min(1, t("cycle.validation.endDateRequired")),
    flowIntensity: z.string().min(1, t("cycle.validation.flowIntensityRequired")),
    notes: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function CycleListView() {
  const { t, locale } = useLanguage()
  const today = new Date()
  const [viewYear, setViewYear] = React.useState(today.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [editingCycle, setEditingCycle] = React.useState<CycleHistoryLog | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [...queryKeys.cycles.list, viewYear, viewMonth],
    queryFn: async () => {
      try {
        const [cyclesData, predictionData, calendarData] = await Promise.all([
          getMyCycles(),
          predictNextPeriod(),
          getCycleCalendar(viewYear, viewMonth),
        ])
        return {
          cycles: cyclesData.cycles,
          prediction: predictionData,
          calendar: calendarData,
        }
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
        throw error
      }
    },
  })

  const cycles = data?.cycles ?? []
  const prediction = data?.prediction ?? null
  const calendar = data?.calendar ?? null
  const loading = isLoading

  async function loadData() {
    await refetch()
  }

  const schema = React.useMemo(() => buildSchema(t), [t])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { flowIntensity: "medium" } })

  const editForm = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await createCycle({
        cycle_start_date: values.cycleStartDate,
        cycle_end_date: values.cycleEndDate,
        flow_intensity: values.flowIntensity,
        notes: values.notes || null,
      })
      toast.success(t("cycle.toast.logged"))
      reset({ flowIntensity: "medium" })
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function onEditSubmit(values: FormValues) {
    if (!editingCycle) return
    try {
      await updateCycle(editingCycle.id, {
        cycle_start_date: values.cycleStartDate,
        cycle_end_date: values.cycleEndDate,
        flow_intensity: values.flowIntensity,
        notes: values.notes || null,
      })
      toast.success(t("cycle.toast.updated"))
      setEditingCycle(null)
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function onDeleteCycle(id: number) {
    try {
      await deleteCycle(id)
      toast.success(t("cycle.toast.deleted"))
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  function openEdit(cycle: CycleHistoryLog) {
    setEditingCycle(cycle)
    editForm.reset({
      cycleStartDate: cycle.cycle_start_date,
      cycleEndDate: cycle.cycle_end_date,
      flowIntensity: cycle.flow_intensity,
      notes: cycle.notes ?? "",
    })
  }

  function flowLabel(value: string) {
    const key = FLOW_LABEL_KEYS[value]
    return key ? t(key) : value
  }

  const weekdayLabels = locale === "ta"
    ? ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div>
      <PageHeader title={t("cycle.title")} description={t("cycle.description")} />

      <Card className="mb-6 rounded-3xl">
        <CardHeader>
          <CardTitle>{t("cycle.calendar.title")}</CardTitle>
          <CardDescription>{t("cycle.calendar.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {calendar ? (
            <CycleCalendar
              calendar={calendar}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={(year, month) => {
                setViewYear(year)
                setViewMonth(month)
              }}
              weekdayLabels={weekdayLabels}
              labels={{
                period: t("cycle.calendar.legend.period"),
                predicted: t("cycle.calendar.legend.predicted"),
                fertile: t("cycle.calendar.legend.fertile"),
                ovulation: t("cycle.calendar.legend.ovulation"),
                pms: t("cycle.calendar.legend.pms"),
                logged: t("cycle.calendar.legend.logged"),
              }}
            />
          ) : (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          )}
          {selectedDate ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("cycle.calendar.selectedDate", { date: selectedDate })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("cycle.prediction.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("cycle.prediction.nextPeriod")}</p>
            <p className="text-2xl font-bold text-primary">{prediction?.predicted_next_period_date ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("cycle.form.title")}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("cycle.form.startDate")} error={errors.cycleStartDate?.message}>
                  <Input type="date" {...register("cycleStartDate")} />
                </Field>
                <Field label={t("cycle.form.endDate")} error={errors.cycleEndDate?.message}>
                  <Input type="date" {...register("cycleEndDate")} />
                </Field>
              </div>
              <Field label={t("cycle.form.flowIntensity")} error={errors.flowIntensity?.message}>
                <Select {...register("flowIntensity")}>
                  <option value="light">{t("cycle.flow.light")}</option>
                  <option value="medium">{t("cycle.flow.medium")}</option>
                  <option value="heavy">{t("cycle.flow.heavy")}</option>
                  <option value="very_heavy">{t("cycle.flow.veryHeavy")}</option>
                </Select>
              </Field>
              <Field label={t("cycle.form.notes")}>
                <Textarea rows={3} {...register("notes")} />
              </Field>
              <Button type="submit" disabled={isSubmitting} className="rounded-full">
                {isSubmitting ? t("cycle.form.submitting") : t("cycle.form.submit")}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

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
                  <TableHead>{t("cycle.history.notes")}</TableHead>
                  <TableHead>{t("cycle.history.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>{cycle.cycle_start_date}</TableCell>
                    <TableCell>{cycle.cycle_end_date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{flowLabel(cycle.flow_intensity)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{cycle.notes ?? "—"}</TableCell>
                    <TableCell className="space-x-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(cycle)}>
                        {t("cycle.history.edit")}
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => void onDeleteCycle(cycle.id)}>
                        {t("cycle.history.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingCycle)} onOpenChange={(open) => !open && setEditingCycle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cycle.history.editTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <Field label={t("cycle.form.startDate")}>
              <Input type="date" {...editForm.register("cycleStartDate")} />
            </Field>
            <Field label={t("cycle.form.endDate")}>
              <Input type="date" {...editForm.register("cycleEndDate")} />
            </Field>
            <Field label={t("cycle.form.flowIntensity")}>
              <Select {...editForm.register("flowIntensity")}>
                <option value="light">{t("cycle.flow.light")}</option>
                <option value="medium">{t("cycle.flow.medium")}</option>
                <option value="heavy">{t("cycle.flow.heavy")}</option>
                <option value="very_heavy">{t("cycle.flow.veryHeavy")}</option>
              </Select>
            </Field>
            <Field label={t("cycle.form.notes")}>
              <Textarea rows={3} {...editForm.register("notes")} />
            </Field>
            <DialogFooter>
              <Button type="submit" className="rounded-full">{t("cycle.history.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
