"use client"

import { Droplet } from "lucide-react"

import type { CycleInsights, CyclePhaseRanges } from "@/types/cycle-history-log"

const RING = 132
const DOT_RING = 108
const CX = 200
const CY = 200

const TRACK_COLOR = "rgba(255,255,255,0.1)"
const PERIOD_COLOR = "#f429a0"
const PERIOD_DOT_COLOR = "#f54baf"
const INNER_DOT = "rgba(255,255,255,0.22)"
const INNER_DOT_PASSED = "rgba(255,255,255,0.45)"

interface CycleWheelProps {
  insights: CycleInsights
  todayLabel: string
  statusLabel: string
  dayMarkerLabel: string
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

export function CycleWheel({
  insights,
  todayLabel,
  statusLabel,
  dayMarkerLabel,
}: CycleWheelProps) {
  const totalDays = insights.average_cycle_length || 28
  const periodDays = insights.average_period_length || 5
  const cycleDay = Math.min(Math.max(insights.cycle_day ?? 1, 1), totalDays)
  const schedule = buildSchedule(totalDays, periodDays, insights.phase_ranges)

  const periodEndDay = schedule.menstrual.end_day
  const predictedStart = Math.max(periodEndDay + 1, totalDays - periodDays + 1)

  const markerAngle = dayToAngle(cycleDay, totalDays)
  const marker = polarToCartesian(CX, CY, RING + 22, markerAngle)
  const periodStart = polarToCartesian(CX, CY, RING, dayToAngle(1, totalDays))
  const ovulationPoint = polarToCartesian(
    CX,
    CY,
    RING,
    dayToAngle(schedule.ovulation_peak_day, totalDays),
  )

  const innerDots = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    const point = polarToCartesian(CX, CY, DOT_RING, dayToAngle(day, totalDays))
    const isToday = day === cycleDay
    const isPassed = day <= cycleDay
    return {
      day,
      point,
      fill: isToday ? "#ffffff" : isPassed ? INNER_DOT_PASSED : INNER_DOT,
      radius: isToday ? 4.5 : 2.5,
    }
  })

  const predictedDots = Array.from(
    { length: Math.max(0, totalDays - predictedStart + 1) },
    (_, index) => {
      const day = predictedStart + index
      return polarToCartesian(CX, CY, RING, dayToAngle(day, totalDays))
    },
  )

  const periodArcEnd = dayToAngle(periodEndDay, totalDays)
  const periodArcStart = dayToAngle(1, totalDays)

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <svg viewBox="0 0 400 400" className="h-auto w-full" aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={RING}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={34}
          strokeLinecap="round"
        />

        {periodEndDay >= 1 ? (
          <path
            d={describeArc(CX, CY, RING, periodArcStart, periodArcEnd)}
            fill="none"
            stroke={PERIOD_COLOR}
            strokeWidth={34}
            strokeLinecap="round"
          />
        ) : null}

        {predictedDots.map((point, index) => (
          <circle
            key={`predicted-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={PERIOD_DOT_COLOR}
          />
        ))}

        {innerDots.map(({ day, point, fill, radius }) => (
          <circle key={day} cx={point.x} cy={point.y} r={radius} fill={fill} />
        ))}

        <foreignObject
          x={periodStart.x - 14}
          y={periodStart.y - 14}
          width={28}
          height={28}
          className="overflow-visible"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-[#f429a0] shadow-sm">
            <Droplet className="size-3.5 fill-white text-white" strokeWidth={0} />
          </div>
        </foreignObject>

        <circle
          cx={ovulationPoint.x}
          cy={ovulationPoint.y}
          r={10}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
        />
        <circle cx={ovulationPoint.x} cy={ovulationPoint.y} r={3} fill="#ffffff" opacity={0.85} />

        <foreignObject
          x={marker.x - 44}
          y={marker.y - 16}
          width={88}
          height={32}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center rounded-full bg-[#2a2a2e] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            {dayMarkerLabel}
          </div>
        </foreignObject>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <p className="text-sm font-medium text-white/75">{todayLabel}</p>
        <p className="mt-4 text-xl font-bold leading-snug tracking-tight text-white md:text-[1.65rem]">
          {statusLabel}
        </p>
      </div>
    </div>
  )
}
