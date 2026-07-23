"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CycleCalendarData } from "@/types/daily-log"

interface CycleCalendarProps {
  calendar: CycleCalendarData
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (year: number, month: number) => void
  labels: {
    period: string
    predicted: string
    fertile: string
    ovulation: string
    pms: string
    logged: string
  }
  weekdayLabels: string[]
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function CycleCalendar({
  calendar,
  selectedDate,
  onSelectDate,
  onMonthChange,
  labels,
  weekdayLabels,
}: CycleCalendarProps) {
  const { year, month } = calendar
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const loggedDates = new Set(calendar.daily_logs.map((log) => log.log_date))

  function shiftMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1)
    onMonthChange(date.getFullYear(), date.getMonth() + 1)
  }

  const cells: React.ReactNode[] = []
  for (let i = 0; i < firstDay; i += 1) {
    cells.push(<div key={`empty-${i}`} />)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = toDateKey(year, month, day)
    const isPeriod = calendar.period_days.includes(dateKey)
    const isPredicted = calendar.predicted_period_days.includes(dateKey)
    const isFertile = calendar.fertile_days.includes(dateKey)
    const isOvulation = calendar.ovulation_days.includes(dateKey)
    const isPms = calendar.pms_days.includes(dateKey)
    const isLogged = loggedDates.has(dateKey)
    const isSelected = selectedDate === dateKey

    cells.push(
      <button
        key={dateKey}
        type="button"
        onClick={() => onSelectDate(dateKey)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-xl text-sm transition-colors",
          isSelected && "ring-2 ring-primary ring-offset-2",
          isPeriod && "bg-primary text-primary-foreground",
          !isPeriod && isPredicted && "bg-primary/20 text-primary",
          !isPeriod && !isPredicted && isOvulation && "bg-violet-600 text-white",
          !isPeriod && !isPredicted && !isOvulation && isFertile && "bg-violet-200 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100",
          !isPeriod && !isPredicted && !isOvulation && !isFertile && isPms && "bg-pink-200/80 text-pink-900 dark:bg-pink-900/30",
          !isPeriod && !isPredicted && !isOvulation && !isFertile && !isPms && "hover:bg-muted",
        )}
      >
        {day}
        {isLogged ? (
          <span className="absolute bottom-1 size-1.5 rounded-full bg-current opacity-80" />
        ) : null}
      </button>,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => shiftMonth(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <p className="font-heading text-lg font-semibold">
          {new Date(year, month - 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={() => shiftMonth(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{cells}</div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend color="bg-primary" label={labels.period} />
        <Legend color="bg-primary/20" label={labels.predicted} />
        <Legend color="bg-violet-600" label={labels.ovulation} />
        <Legend color="bg-violet-200 dark:bg-violet-900/40" label={labels.fertile} />
        <Legend color="bg-pink-200/80 dark:bg-pink-900/30" label={labels.pms} />
        <Legend dot label={labels.logged} />
      </div>
    </div>
  )
}

function Legend({ color, dot, label }: { color?: string; dot?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot ? (
        <span className="size-2 rounded-full bg-foreground" />
      ) : (
        <span className={cn("size-3 rounded-sm", color)} />
      )}
      {label}
    </span>
  )
}
