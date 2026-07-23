"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"

import type { CycleInsights } from "@/types/cycle-history-log"

const RING = 132
const DOT_RING = 96
const CX = 200
const CY = 200

interface CycleWheelProps {
  insights: CycleInsights
  todayLabel: string
  statusLabel: string
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

function dayPhase(
  day: number,
  periodDays: number,
  fertileStart: number,
  ovulationDay: number,
  pmsStart: number,
) {
  if (day <= periodDays) return "menstrual"
  if (day >= fertileStart && day <= ovulationDay) return "fertile"
  if (day >= pmsStart) return "pms"
  return "default"
}

export function CycleWheel({
  insights,
  todayLabel,
  statusLabel,
  dayMarkerLabel,
  learnAboutCycleLabel,
  learnAboutCycleHref = "/dashboard/insights",
}: CycleWheelProps) {
  const totalDays = insights.average_cycle_length || 28
  const periodDays = insights.average_period_length || 5
  const cycleDay = Math.min(insights.cycle_day ?? 1, totalDays)

  const ovulationDay = Math.max(periodDays + 1, totalDays - 14)
  const fertileStart = Math.max(periodDays + 1, ovulationDay - 5)
  const pmsStart = Math.max(fertileStart + 1, totalDays - 6)

  const arcs = [
    { start: 1, end: periodDays, color: "#f429a0", width: 28 },
    { start: fertileStart, end: ovulationDay, color: "#f76dbe", width: 28 },
    { start: pmsStart, end: totalDays, color: "#f98fcd", width: 20, opacity: 0.85 },
  ]

  const markerAngle = dayToAngle(cycleDay, totalDays)
  const marker = polarToCartesian(CX, CY, RING + 18, markerAngle)
  const periodIcon = polarToCartesian(CX, CY, RING + 4, dayToAngle(1, totalDays))

  const dots = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    const angle = dayToAngle(day, totalDays)
    const point = polarToCartesian(CX, CY, DOT_RING, angle)
    const phase = dayPhase(day, periodDays, fertileStart, ovulationDay, pmsStart)
    const isToday = day === cycleDay
    let fill = "rgba(255,255,255,0.22)"
    if (phase === "menstrual") fill = "#f429a0"
    if (phase === "fertile") fill = "#f76dbe"
    if (phase === "pms") fill = "#f98fcd"
    if (isToday) fill = "#ffffff"
    return { day, point, fill, isToday }
  })

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <svg viewBox="0 0 400 400" className="h-auto w-full" aria-hidden>
        {/* Base track */}
        <circle
          cx={CX}
          cy={CY}
          r={RING}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={28}
        />

        {/* Phase arcs */}
        {arcs.map((arc) => {
          if (arc.end < arc.start) return null
          const startAngle = dayToAngle(arc.start, totalDays)
          const endAngle = dayToAngle(arc.end, totalDays)
          return (
            <path
              key={`${arc.start}-${arc.end}`}
              d={describeArc(CX, CY, RING, startAngle, endAngle)}
              fill="none"
              stroke={arc.color}
              strokeWidth={arc.width}
              strokeLinecap="round"
              opacity={arc.opacity ?? 1}
            />
          )
        })}

        {/* Inner dotted ring */}
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

        {/* Period droplet marker */}
        <circle cx={periodIcon.x} cy={periodIcon.y} r={9} fill="#f429a0" stroke="#ffffff" strokeWidth={2} />
        <circle cx={periodIcon.x} cy={periodIcon.y + 1} r={2.5} fill="#ffffff" opacity={0.9} />

        {/* Fertile window marker */}
        {fertileStart <= ovulationDay ? (
          <circle
            cx={polarToCartesian(CX, CY, RING + 2, dayToAngle(Math.round((fertileStart + ovulationDay) / 2), totalDays)).x}
            cy={polarToCartesian(CX, CY, RING + 2, dayToAngle(Math.round((fertileStart + ovulationDay) / 2), totalDays)).y}
            r={7}
            fill="#f76dbe"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ) : null}

        {/* Current day bubble */}
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

      {/* Center status — Clue-style */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-sm font-medium text-white/70">{todayLabel}</p>
        <p className="mt-3 text-xl font-bold leading-snug text-white md:text-2xl">{statusLabel}</p>
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
