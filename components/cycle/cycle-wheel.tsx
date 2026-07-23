"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"

import type { CycleInsights, CyclePhaseRanges } from "@/types/cycle-history-log"

const RING = 132
const DOT_RING = 96
const CX = 200
const CY = 200

const PHASE_COLORS = {
  menstrual: "#f429a0",
  follicular: "#7ec8e3",
  ovulation: "#f76dbe",
  luteal: "#f98fcd",
  pms: "#f54baf",
  default: "rgba(255,255,255,0.22)",
} as const

interface CycleWheelProps {
  insights: CycleInsights
  todayLabel: string
  statusLabel: string
  phaseLabel?: string
  dayMarkerLabel: string
  learnAboutCycleLabel: string
  learnAboutCycleHref?: string
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
  return ((day - 0.5) / totalDays) * 360
}

function buildSchedule(
  totalDays: number,
  periodDays: number,
  phaseRanges?: CyclePhaseRanges | null,
): CyclePhaseRanges {
  if (phaseRanges) return phaseRanges

  const ovulationPeak = totalDays - 14
  const ovulationStart = Math.max(periodDays + 1, ovulationPeak - 1)
  const ovulationEnd = Math.min(totalDays, ovulationPeak + 1)
  const follicularEnd = ovulationStart - 1

  return {
    menstrual: { start_day: 1, end_day: periodDays },
    follicular:
      follicularEnd >= periodDays + 1
        ? { start_day: periodDays + 1, end_day: follicularEnd }
        : null,
    ovulation: { start_day: ovulationStart, end_day: ovulationEnd },
    luteal:
      ovulationEnd + 1 <= totalDays
        ? { start_day: ovulationEnd + 1, end_day: totalDays }
        : null,
    pms: { start_day: Math.max(ovulationEnd + 1, totalDays - 6), end_day: totalDays },
    ovulation_peak_day: ovulationPeak,
  }
}

function dayPhase(day: number, schedule: CyclePhaseRanges): keyof typeof PHASE_COLORS {
  if (day >= schedule.menstrual.start_day && day <= schedule.menstrual.end_day) {
    return "menstrual"
  }
  if (
    schedule.follicular &&
    day >= schedule.follicular.start_day &&
    day <= schedule.follicular.end_day
  ) {
    return "follicular"
  }
  if (day >= schedule.ovulation.start_day && day <= schedule.ovulation.end_day) {
    return "ovulation"
  }
  if (day >= schedule.pms.start_day && day <= schedule.pms.end_day) {
    return "pms"
  }
  if (schedule.luteal && day >= schedule.luteal.start_day && day <= schedule.luteal.end_day) {
    return "luteal"
  }
  return "default"
}

export function CycleWheel({
  insights,
  todayLabel,
  statusLabel,
  phaseLabel,
  dayMarkerLabel,
  learnAboutCycleLabel,
  learnAboutCycleHref = "/dashboard/insights",
}: CycleWheelProps) {
  const totalDays = insights.average_cycle_length || 28
  const periodDays = insights.average_period_length || 5
  const cycleDay = Math.min(Math.max(insights.cycle_day ?? 1, 1), totalDays)
  const schedule = buildSchedule(totalDays, periodDays, insights.phase_ranges)

  const arcs: Array<{
    start: number
    end: number
    color: string
    width: number
    opacity?: number
  }> = [
    {
      start: schedule.menstrual.start_day,
      end: schedule.menstrual.end_day,
      color: PHASE_COLORS.menstrual,
      width: 28,
    },
  ]

  if (schedule.follicular) {
    arcs.push({
      start: schedule.follicular.start_day,
      end: schedule.follicular.end_day,
      color: PHASE_COLORS.follicular,
      width: 24,
      opacity: 0.95,
    })
  }

  arcs.push({
    start: schedule.ovulation.start_day,
    end: schedule.ovulation.end_day,
    color: PHASE_COLORS.ovulation,
    width: 28,
  })

  if (schedule.luteal) {
    const pmsStart = schedule.pms.start_day
    if (schedule.luteal.end_day >= pmsStart) {
      arcs.push({
        start: schedule.luteal.start_day,
        end: pmsStart - 1,
        color: PHASE_COLORS.luteal,
        width: 22,
        opacity: 0.75,
      })
    }
    arcs.push({
      start: pmsStart,
      end: schedule.pms.end_day,
      color: PHASE_COLORS.pms,
      width: 20,
      opacity: 0.9,
    })
  }

  const markerAngle = dayToAngle(cycleDay, totalDays)
  const marker = polarToCartesian(CX, CY, RING + 18, markerAngle)
  const periodIcon = polarToCartesian(CX, CY, RING + 4, dayToAngle(1, totalDays))
  const ovulationIcon = polarToCartesian(
    CX,
    CY,
    RING + 4,
    dayToAngle(schedule.ovulation_peak_day, totalDays),
  )

  const dots = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    const angle = dayToAngle(day, totalDays)
    const point = polarToCartesian(CX, CY, DOT_RING, angle)
    const phase = dayPhase(day, schedule)
    const isToday = day === cycleDay
    let fill: string = PHASE_COLORS.default
    if (phase !== "default") fill = PHASE_COLORS[phase]
    if (isToday) fill = "#ffffff"
    return { day, point, fill, isToday }
  })

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <svg viewBox="0 0 400 400" className="h-auto w-full" aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={RING}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={28}
        />

        {arcs.map((arc) => {
          if (arc.end < arc.start) return null
          const startAngle = dayToAngle(arc.start, totalDays)
          const endAngle = dayToAngle(arc.end, totalDays)
          return (
            <path
              key={`${arc.start}-${arc.end}-${arc.color}`}
              d={describeArc(CX, CY, RING, startAngle, endAngle)}
              fill="none"
              stroke={arc.color}
              strokeWidth={arc.width}
              strokeLinecap="round"
              opacity={arc.opacity ?? 1}
            />
          )
        })}

        {dots.map(({ day, point, fill, isToday }) => (
          <circle
            key={day}
            cx={point.x}
            cy={point.y}
            r={isToday ? 4.5 : 3}
            fill={fill}
            opacity={isToday ? 1 : 0.9}
          />
        ))}

        <circle
          cx={periodIcon.x}
          cy={periodIcon.y}
          r={9}
          fill={PHASE_COLORS.menstrual}
          stroke="#ffffff"
          strokeWidth={2}
        />
        <circle
          cx={periodIcon.x}
          cy={periodIcon.y + 1}
          r={2.5}
          fill="#ffffff"
          opacity={0.9}
        />

        <circle
          cx={ovulationIcon.x}
          cy={ovulationIcon.y}
          r={7}
          fill={PHASE_COLORS.ovulation}
          stroke="#ffffff"
          strokeWidth={2}
        />

        <foreignObject
          x={marker.x - 42}
          y={marker.y - 16}
          width={84}
          height={32}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center rounded-full border border-white/20 bg-[#1a1020]/95 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
            {dayMarkerLabel}
          </div>
        </foreignObject>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-sm font-medium text-white/70">{todayLabel}</p>
        <p className="mt-3 text-xl font-bold leading-snug text-white md:text-2xl">{statusLabel}</p>
        {phaseLabel ? (
          <p className="mt-2 text-sm font-medium text-[#f98fcd]">{phaseLabel}</p>
        ) : null}
        <Link
          href={learnAboutCycleHref}
          className="pointer-events-auto mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#f98fcd] transition-colors hover:text-white"
        >
          {learnAboutCycleLabel}
          <ChevronDown className="size-4 rotate-[-90deg]" />
        </Link>
      </div>
    </div>
  )
}
