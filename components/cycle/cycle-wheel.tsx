"use client"

import type { CycleInsights, CyclePhase } from "@/types/cycle-history-log"

const PHASE_COLORS: Record<CyclePhase, string> = {
  menstrual: "#f429a0",
  follicular: "#f98fcd",
  fertile: "#9b59b6",
  ovulation: "#7c3aed",
  luteal: "#e8b4d4",
  pms: "#f76dbe",
}

interface CycleWheelProps {
  insights: CycleInsights
  phaseLabel: string
  cycleDayLabel: string
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

function dayToAngle(day: number, totalDays: number) {
  return (day / totalDays) * 360
}

export function CycleWheel({ insights, phaseLabel, cycleDayLabel }: CycleWheelProps) {
  const totalDays = insights.average_cycle_length || 28
  const periodDays = insights.average_period_length || 5
  const cycleDay = insights.cycle_day ?? 1

  const ovulationDay = Math.max(periodDays + 1, totalDays - 14)
  const fertileStart = Math.max(periodDays + 1, ovulationDay - 5)
  const pmsStart = Math.max(fertileStart, totalDays - 6)

  const segments = [
    { start: 1, end: periodDays, color: PHASE_COLORS.menstrual, opacity: 0.95 },
    { start: periodDays + 1, end: fertileStart - 1, color: PHASE_COLORS.follicular, opacity: 0.55 },
    { start: fertileStart, end: ovulationDay - 1, color: PHASE_COLORS.fertile, opacity: 0.75 },
    { start: ovulationDay, end: ovulationDay, color: PHASE_COLORS.ovulation, opacity: 1 },
    { start: ovulationDay + 1, end: pmsStart - 1, color: PHASE_COLORS.luteal, opacity: 0.45 },
    { start: pmsStart, end: totalDays, color: PHASE_COLORS.pms, opacity: 0.7 },
  ]

  const markerAngle = dayToAngle(Math.min(cycleDay, totalDays), totalDays)
  const marker = polarToCartesian(120, 120, 92, markerAngle)

  return (
    <div className="relative mx-auto flex w-full max-w-[280px] flex-col items-center">
      <svg viewBox="0 0 240 240" className="h-auto w-full drop-shadow-sm">
        <circle cx="120" cy="120" r="98" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
        {segments.map((segment) => {
          if (segment.end < segment.start) return null
          const startAngle = dayToAngle(segment.start - 0.5, totalDays)
          const endAngle = dayToAngle(segment.end + 0.5, totalDays)
          return (
            <path
              key={`${segment.start}-${segment.end}`}
              d={describeArc(120, 120, 98, startAngle, endAngle)}
              fill="none"
              stroke={segment.color}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={segment.opacity}
            />
          )
        })}
        <circle cx={marker.x} cy={marker.y} r="8" fill="white" stroke="#f429a0" strokeWidth="3" />
        <circle cx="120" cy="120" r="58" fill="var(--card)" opacity="0.92" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{phaseLabel}</p>
        <p className="font-heading text-4xl font-bold text-primary">{cycleDay}</p>
        <p className="text-sm text-muted-foreground">{cycleDayLabel}</p>
      </div>
    </div>
  )
}
