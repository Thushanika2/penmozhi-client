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
  DialogDescription,
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
import {
  GAP_REASON_OPTIONS,
  countTypicalGaps,
  findUnusualGapBefore,
  type GapReason,
} from "@/lib/cycle-gap"
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
  type PriorPeriodPayload,
} from "@/services/cycle"
import type { CycleHistoryLog } from "@/types/cycle-history-log"

const FLOW_LABEL_KEYS: Record<string, string> = {
  light: "cycle.flow.light",
  medium: "cycle.flow.medium",
  heavy: "cycle.flow.heavy",
  very_heavy: "cycle.flow.veryHeavy",
}

const GAP_REASON_LABEL_KEYS: Record<GapReason, string> = {
  medication: "cycle.gap.reasons.medication",
  medical: "cycle.gap.reasons.medical",
  stress: "cycle.gap.reasons.stress",
  missed_logging: "cycle.gap.reasons.missedLogging",
  contraception: "cycle.gap.reasons.contraception",
  pregnancy_postpartum: "cycle.gap.reasons.pregnancyPostpartum",
  other: "cycle.gap.reasons.other",
}

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      cycleStartDate: z.string().min(1, t("cycle.validation.startDateRequired")),
      cycleEndDate: z.string().min(1, t("cycle.validation.endDateRequired")),
      flowIntensity: z.string().min(1, t("cycle.validation.flowIntensityRequired")),
      notes: z.string().optional(),
    })
    .refine((values) => values.cycleEndDate >= values.cycleStartDate, {
      message: t("cycle.validation.endAfterStart"),
      path: ["cycleEndDate"],
    })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

type GapWizardState = {
  pendingValues: FormValues
  gapDays: number
  previousStart: string
  newStart: string
  gapReason: GapReason | null
  priorPeriods: PriorPeriodPayload[]
  draftPrior: {
    cycleStartDate: string
    cycleEndDate: string
    flowIntensity: string
  }
  priorError: string | null
}

export function CycleListView() {
  const { t, locale } = useLanguage()
  const today = new Date()
  const [viewYear, setViewYear] = React.useState(today.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [editingCycle, setEditingCycle] = React.useState<CycleHistoryLog | null>(null)
  const [gapWizard, setGapWizard] = React.useState<GapWizardState | null>(null)

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

  function openGapWizard(values: FormValues, gap: { previousStart: string; newStart: string; gapDays: number }) {
    setGapWizard({
      pendingValues: values,
      gapDays: gap.gapDays,
      previousStart: gap.previousStart,
      newStart: gap.newStart,
      gapReason: null,
      priorPeriods: [],
      draftPrior: {
        cycleStartDate: "",
        cycleEndDate: "",
        flowIntensity: "medium",
      },
      priorError: null,
    })
  }

  async function saveCycle(
    values: FormValues,
    extras?: { gap_reason?: GapReason | null; prior_periods?: PriorPeriodPayload[] },
  ) {
    await createCycle({
      cycle_start_date: values.cycleStartDate,
      cycle_end_date: values.cycleEndDate,
      flow_intensity: values.flowIntensity,
      notes: values.notes || null,
      gap_reason: extras?.gap_reason ?? null,
      prior_periods: extras?.prior_periods ?? [],
    })
    toast.success(t("cycle.toast.logged"))
    reset({ flowIntensity: "medium" })
    setGapWizard(null)
    await loadData()
  }

  async function onSubmit(values: FormValues) {
    const existingStarts = cycles.map((cycle) => cycle.cycle_start_date)
    const unusual = findUnusualGapBefore(existingStarts, values.cycleStartDate)
    if (unusual) {
      openGapWizard(values, unusual)
      return
    }

    try {
      await saveCycle(values)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  function gapHistoryResolved(priorPeriods: PriorPeriodPayload[], newStart: string) {
    const mergedStarts = [
      ...cycles.map((cycle) => cycle.cycle_start_date),
      ...priorPeriods.map((period) => period.cycle_start_date),
    ]
    const bridged = !findUnusualGapBefore(mergedStarts, newStart)
    const typicalCount = countTypicalGaps(mergedStarts)
    return bridged || typicalCount >= 1
  }

  function addPriorPeriodToWizard() {
    if (!gapWizard) return
    const { draftPrior, pendingValues, priorPeriods } = gapWizard
    if (!draftPrior.cycleStartDate || !draftPrior.cycleEndDate) {
      setGapWizard({
        ...gapWizard,
        priorError: t("cycle.gap.validation.priorDatesRequired"),
      })
      return
    }
    if (draftPrior.cycleEndDate < draftPrior.cycleStartDate) {
      setGapWizard({
        ...gapWizard,
        priorError: t("cycle.gap.validation.priorEndAfterStart"),
      })
      return
    }
    if (draftPrior.cycleStartDate >= pendingValues.cycleStartDate) {
      setGapWizard({
        ...gapWizard,
        priorError: t("cycle.gap.validation.priorBeforeNew"),
      })
      return
    }

    const existingStarts = new Set([
      ...cycles.map((cycle) => cycle.cycle_start_date),
      ...priorPeriods.map((period) => period.cycle_start_date),
    ])
    if (existingStarts.has(draftPrior.cycleStartDate)) {
      setGapWizard({
        ...gapWizard,
        priorError: t("cycle.gap.validation.priorDuplicate"),
      })
      return
    }

    const nextPriors: PriorPeriodPayload[] = [
      ...priorPeriods,
      {
        cycle_start_date: draftPrior.cycleStartDate,
        cycle_end_date: draftPrior.cycleEndDate,
        flow_intensity: draftPrior.flowIntensity,
      },
    ]

    const mergedStarts = [
      ...cycles.map((cycle) => cycle.cycle_start_date),
      ...nextPriors.map((period) => period.cycle_start_date),
    ]
    const stillUnusual = findUnusualGapBefore(mergedStarts, pendingValues.cycleStartDate)
    const typicalCount = countTypicalGaps(mergedStarts)
    const resolved = !stillUnusual || typicalCount >= 1

    // Keep asking until the unusual gap is bridged or typical history exists.
    if (!resolved && stillUnusual) {
      setGapWizard({
        ...gapWizard,
        priorPeriods: nextPriors,
        draftPrior: {
          cycleStartDate: "",
          cycleEndDate: "",
          flowIntensity: "medium",
        },
        priorError: t("cycle.gap.needAnotherPrior", {
          days: stillUnusual.gapDays,
          previous: stillUnusual.previousStart,
          prior: stillUnusual.newStart,
        }),
      })
      return
    }

    setGapWizard({
      ...gapWizard,
      priorPeriods: nextPriors,
      draftPrior: {
        cycleStartDate: "",
        cycleEndDate: "",
        flowIntensity: "medium",
      },
      priorError: null,
    })
  }

  async function confirmGapWizard() {
    if (!gapWizard) return
    if (!gapWizard.gapReason) {
      setGapWizard({ ...gapWizard, priorError: t("cycle.gap.validation.reasonRequired") })
      return
    }
    if (!gapWizard.priorPeriods.length) {
      setGapWizard({ ...gapWizard, priorError: t("cycle.gap.validation.priorRequired") })
      return
    }
    if (!gapHistoryResolved(gapWizard.priorPeriods, gapWizard.pendingValues.cycleStartDate)) {
      const mergedStarts = [
        ...cycles.map((cycle) => cycle.cycle_start_date),
        ...gapWizard.priorPeriods.map((period) => period.cycle_start_date),
      ]
      const stillUnusual = findUnusualGapBefore(
        mergedStarts,
        gapWizard.pendingValues.cycleStartDate,
      )
      setGapWizard({
        ...gapWizard,
        priorError: stillUnusual
          ? t("cycle.gap.needAnotherPrior", {
              days: stillUnusual.gapDays,
              previous: stillUnusual.previousStart,
              prior: stillUnusual.newStart,
            })
          : t("cycle.gap.validation.priorRequired"),
      })
      return
    }

    try {
      await saveCycle(gapWizard.pendingValues, {
        gap_reason: gapWizard.gapReason,
        prior_periods: gapWizard.priorPeriods,
      })
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
        gap_reason: editingCycle.gap_reason ?? null,
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

  const predictionNote = prediction?.outlier_gaps_excluded
    ? t("cycle.prediction.excludedOutliers", { count: prediction.outlier_gaps_excluded })
    : prediction?.prediction_quality?.using_profile_default
      ? t("cycle.prediction.usingDefault")
      : prediction?.average_cycle_length
        ? t("cycle.prediction.basedOnLength", { days: prediction.average_cycle_length })
        : t("cycle.prediction.basedOnHistory")

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
            <p className="text-sm text-muted-foreground">{predictionNote}</p>
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
                      {cycle.gap_reason ? (
                        <Badge variant="outline" className="ml-2">
                          {t(GAP_REASON_LABEL_KEYS[cycle.gap_reason as GapReason] ?? "cycle.gap.reasons.other")}
                        </Badge>
                      ) : null}
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

      <Dialog open={Boolean(gapWizard)} onOpenChange={(open) => !open && setGapWizard(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("cycle.gap.title")}</DialogTitle>
            <DialogDescription>
              {gapWizard
                ? t("cycle.gap.description", {
                    days: gapWizard.gapDays,
                    previous: gapWizard.previousStart,
                    next: gapWizard.newStart,
                  })
                : null}
            </DialogDescription>
          </DialogHeader>

          {gapWizard ? (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{t("cycle.gap.explain")}</p>

              <div className="space-y-2">
                <Label>{t("cycle.gap.reasonLabel")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {GAP_REASON_OPTIONS.map((reason) => {
                    const selected = gapWizard.gapReason === reason
                    return (
                      <Button
                        key={reason}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                        onClick={() =>
                          setGapWizard({ ...gapWizard, gapReason: reason, priorError: null })
                        }
                      >
                        {t(GAP_REASON_LABEL_KEYS[reason])}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">{t("cycle.gap.priorTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("cycle.gap.priorHelp")}</p>
                </div>
                {gapWizard.priorPeriods.length ? (
                  <ul className="space-y-1 text-sm">
                    {gapWizard.priorPeriods.map((period) => (
                      <li key={period.cycle_start_date}>
                        {period.cycle_start_date} → {period.cycle_end_date} ({flowLabel(period.flow_intensity)})
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("cycle.form.startDate")}>
                    <Input
                      type="date"
                      value={gapWizard.draftPrior.cycleStartDate}
                      max={gapWizard.pendingValues.cycleStartDate}
                      onChange={(event) =>
                        setGapWizard({
                          ...gapWizard,
                          draftPrior: {
                            ...gapWizard.draftPrior,
                            cycleStartDate: event.target.value,
                          },
                          priorError: null,
                        })
                      }
                    />
                  </Field>
                  <Field label={t("cycle.form.endDate")}>
                    <Input
                      type="date"
                      value={gapWizard.draftPrior.cycleEndDate}
                      max={gapWizard.pendingValues.cycleStartDate}
                      onChange={(event) =>
                        setGapWizard({
                          ...gapWizard,
                          draftPrior: {
                            ...gapWizard.draftPrior,
                            cycleEndDate: event.target.value,
                          },
                          priorError: null,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label={t("cycle.form.flowIntensity")}>
                  <Select
                    value={gapWizard.draftPrior.flowIntensity}
                    onChange={(event) =>
                      setGapWizard({
                        ...gapWizard,
                        draftPrior: {
                          ...gapWizard.draftPrior,
                          flowIntensity: event.target.value,
                        },
                      })
                    }
                  >
                    <option value="light">{t("cycle.flow.light")}</option>
                    <option value="medium">{t("cycle.flow.medium")}</option>
                    <option value="heavy">{t("cycle.flow.heavy")}</option>
                    <option value="very_heavy">{t("cycle.flow.veryHeavy")}</option>
                  </Select>
                </Field>
                <Button type="button" variant="outline" className="rounded-full" onClick={addPriorPeriodToWizard}>
                  {t("cycle.gap.addPrior")}
                </Button>
              </div>

              {gapWizard.priorError ? (
                <p className="text-sm text-destructive">{gapWizard.priorError}</p>
              ) : null}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setGapWizard(null)}>
                  {t("common.cancel")}
                </Button>
                <Button type="button" className="rounded-full" onClick={() => void confirmGapWizard()}>
                  {t("cycle.gap.confirm")}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
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
