"use client"

import * as React from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  buildSuggestedPeriodDates,
  compareDateKeysDesc,
  isFutureDateKey,
} from "@/lib/date-only"
import type { Locale } from "@/i18n/config"
import type { FlowLevel, PeriodHistoryEntry } from "@/types/onboarding"

import { PeriodHistoryPicker } from "./period-history-picker"

const MAX_PERIOD_SELECTIONS = 3

interface MenstrualBaselineStepProps {
  locale: Locale
  averageCycleLength: number
  periodHistory: PeriodHistoryEntry[]
  onCycleLengthChange: (value: number) => void
  onPeriodHistoryChange: (entries: PeriodHistoryEntry[]) => void
  cycleLengthError?: string
  periodHistoryError?: string
  t: (key: string, values?: Record<string, string | number>) => string
}

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function entriesFromDateKeys(dateKeys: string[]): PeriodHistoryEntry[] {
  return dateKeys.map((period_start) => ({ period_start, flow: "" as const }))
}

function sortPeriodEntries(entries: PeriodHistoryEntry[]): PeriodHistoryEntry[] {
  return [...entries].sort((a, b) => compareDateKeysDesc(a.period_start, b.period_start))
}

export function MenstrualBaselineStep({
  locale,
  averageCycleLength,
  periodHistory,
  onCycleLengthChange,
  onPeriodHistoryChange,
  cycleLengthError,
  periodHistoryError,
  t,
}: MenstrualBaselineStepProps) {
  function togglePeriodDate(dateKey: string) {
    if (isFutureDateKey(dateKey)) return

    const existing = periodHistory.find((entry) => entry.period_start === dateKey)
    if (existing) {
      onPeriodHistoryChange(periodHistory.filter((entry) => entry.period_start !== dateKey))
      return
    }

    if (periodHistory.length >= MAX_PERIOD_SELECTIONS) {
      toast.error(t("onboarding.validation.maxThreePeriods"))
      return
    }

    const isFirstSelection = periodHistory.length === 0
    const canAutoSuggest =
      isFirstSelection && averageCycleLength > 0 && Number.isFinite(averageCycleLength)

    if (canAutoSuggest) {
      const suggestedDates = buildSuggestedPeriodDates(
        dateKey,
        averageCycleLength,
        MAX_PERIOD_SELECTIONS,
      )
      onPeriodHistoryChange(sortPeriodEntries(entriesFromDateKeys(suggestedDates)))
      return
    }

    onPeriodHistoryChange(
      sortPeriodEntries([...periodHistory, { period_start: dateKey, flow: "" as const }]),
    )
  }

  function updatePeriodFlow(periodStart: string, flow: FlowLevel | "") {
    onPeriodHistoryChange(
      periodHistory.map((entry) =>
        entry.period_start === periodStart ? { ...entry, flow } : entry,
      ),
    )
  }

  function removePeriodDate(periodStart: string) {
    onPeriodHistoryChange(periodHistory.filter((entry) => entry.period_start !== periodStart))
  }

  return (
    <>
      <Field label={t("onboarding.fields.cycleLength")} error={cycleLengthError}>
        <Input
          type="number"
          className="rounded-xl"
          placeholder={t("onboarding.placeholders.cycleLengthDays")}
          value={averageCycleLength || ""}
          onChange={(event) => onCycleLengthChange(Number(event.target.value))}
        />
      </Field>

      <div className="space-y-2">
        <PeriodHistoryPicker
          locale={locale}
          entries={periodHistory}
          onToggleDate={togglePeriodDate}
          onUpdateFlow={updatePeriodFlow}
          onRemoveDate={removePeriodDate}
          t={t}
        />
        {periodHistoryError ? (
          <p className="text-sm text-destructive">{periodHistoryError}</p>
        ) : null}
      </div>
    </>
  )
}

export function isMenstrualBaselineStepComplete(
  averageCycleLength: number,
  periodHistory: PeriodHistoryEntry[],
): boolean {
  return (
    averageCycleLength >= 21 &&
    averageCycleLength <= 45 &&
    periodHistory.length >= 1 &&
    periodHistory.every((entry) => Boolean(entry.period_start) && Boolean(entry.flow))
  )
}
