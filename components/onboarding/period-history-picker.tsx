"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import type { Locale } from "@/i18n/config"
import {
  compareDateKeysDesc,
  formatDateKey,
  formatMonthYear,
  isFutureDateKey,
  toDateKey,
} from "@/lib/date-only"
import { cn } from "@/lib/utils"
import type { FlowLevel, PeriodHistoryEntry } from "@/types/onboarding"

const FLOW_LEVELS = ["light", "medium", "heavy", "very_heavy"] as const
const MAX_PERIOD_SELECTIONS = 3

interface PeriodHistoryPickerProps {
  locale: Locale
  entries: PeriodHistoryEntry[]
  onToggleDate: (dateKey: string) => void
  onUpdateFlow: (periodStart: string, flow: FlowLevel | "") => void
  onRemoveDate: (periodStart: string) => void
  t: (key: string, values?: Record<string, string | number>) => string
}

function weekdayLabels(locale: Locale) {
  return locale === "ta"
    ? ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
}

export function PeriodHistoryPicker({
  locale,
  entries,
  onToggleDate,
  onUpdateFlow,
  onRemoveDate,
  t,
}: PeriodHistoryPickerProps) {
  const today = new Date()
  const [viewYear, setViewYear] = React.useState(today.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(today.getMonth() + 1)

  const selectedDates = new Set(
    entries.map((entry) => entry.period_start).filter((value) => Boolean(value)),
  )
  const sortedEntries = [...entries]
    .filter((entry) => entry.period_start)
    .sort((a, b) => compareDateKeysDesc(a.period_start, b.period_start))

  function shiftMonth(delta: number) {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1)
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth() + 1)
  }

  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const cells: React.ReactNode[] = []

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(<div key={`empty-${index}`} aria-hidden />)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = toDateKey(viewYear, viewMonth, day)
    const isSelected = selectedDates.has(dateKey)
    const isFuture = isFutureDateKey(dateKey)
    const atMax = selectedDates.size >= MAX_PERIOD_SELECTIONS && !isSelected

    cells.push(
      <button
        key={dateKey}
        type="button"
        disabled={isFuture || atMax}
        aria-pressed={isSelected}
        aria-label={formatDateKey(dateKey, locale)}
        onClick={() => onToggleDate(dateKey)}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg text-xs font-medium transition-colors",
          isSelected && "bg-primary text-primary-foreground shadow-sm",
          !isSelected && !isFuture && !atMax && "hover:bg-primary/10",
          (isFuture || atMax) && "cursor-not-allowed text-muted-foreground/40",
        )}
      >
        {day}
      </button>,
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm leading-relaxed text-foreground/90">
          {t("onboarding.periodHistory.instructions")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("onboarding.periodHistory.selectUpToThree", {
            max: String(MAX_PERIOD_SELECTIONS),
          })}
        </p>
      </div>

      <div className="rounded-xl border border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            onClick={() => shiftMonth(-1)}
            aria-label={t("onboarding.periodHistory.previousMonth")}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <p className="font-heading text-base font-semibold">
            {formatMonthYear(viewYear, viewMonth, locale)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            onClick={() => shiftMonth(1)}
            aria-label={t("onboarding.periodHistory.nextMonth")}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-muted-foreground">
          {weekdayLabels(locale).map((label) => (
            <div key={label} className="py-0.5">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-0.5 grid grid-cols-7 justify-items-center gap-0.5">{cells}</div>
      </div>

      {sortedEntries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("onboarding.periodHistory.selectedDates")}</p>
          <ul className="space-y-2">
            {sortedEntries.map((entry) => (
              <li
                key={entry.period_start}
                className="flex flex-col gap-2 rounded-xl border border-border/60 p-2.5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start">
                  <span className="truncate text-sm font-medium">
                    {formatDateKey(entry.period_start, locale)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    aria-label={t("onboarding.periodHistory.removeDate")}
                    onClick={() => onRemoveDate(entry.period_start)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Label htmlFor={`flow-${entry.period_start}`} className="sr-only">
                    {t("onboarding.fields.typicalFlow")}
                  </Label>
                  <Select
                    id={`flow-${entry.period_start}`}
                    className="rounded-xl"
                    value={entry.flow}
                    onChange={(event) =>
                      onUpdateFlow(entry.period_start, event.target.value as FlowLevel | "")
                    }
                  >
                    <option value="" disabled>
                      {t("onboarding.placeholders.selectFlow")}
                    </option>
                    {FLOW_LEVELS.map((flow) => (
                      <option key={flow} value={flow}>
                        {t(`onboarding.flow.${flow}`)}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
