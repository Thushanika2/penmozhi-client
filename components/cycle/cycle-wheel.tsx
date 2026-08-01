"use client"

import { Droplet } from "lucide-react"
import { motion } from "framer-motion"

import type { CycleInsights, CyclePhaseRanges } from "@/types/cycle-history-log"

const RING = 138
const DOT_RING = 112
const TRACK_WIDTH = 36
const CX = 200
const CY = 200

const TRACK_COLOR = "rgba(255,255,255,0.08)"
const PHASE_COLORS = {
  menstrual: "#cb0a7b",
  follicular: "#f9c5d5",
  ovulation: "#f2789f",
  luteal: "#f999b7",
} as const
const INNER_DOT = "rgba(255,255,255,0.28)"
const INNER_DOT_PASSED = "rgba(255,255,255,0.62)"
const PREDICTED_DOT = "#cb0a7b"

interface CycleWheelProps {
  insights: CycleInsights
  todayLabel: string
  statusLabel: string
  dayWord: string
  cycleDay: number
  phaseLabels: {
    menstrual: string
    follicular: string
    ovulation: string
    luteal: string
  }
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

/** Arc from day start (inclusive) to day end (inclusive), clockwise from 12 o'clock. */
function describeDayArc(
  cx: number,
  cy: number,
  radius: number,
  startDay: number,
  endDay: number,
  totalDays: number,
) {
  const startAngle = ((startDay - 1) / totalDays) * 360
  const endAngle = (endDay / totalDays) * 360
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const sweep = endAngle - startAngle
  const largeArc = sweep > 180 ? 1 : 0
  return `M ${end.x} ${end.y} A ${radius} ${radius} 0 ${largeArc} 1 ${start.x} ${start.y}`
}

function dayCenterAngle(day: number, totalDays: number) {
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
  dayWord,
  cycleDay: cycleDayProp,
  phaseLabels,
}: CycleWheelProps) {
  const totalDays = insights.average_cycle_length || 28
  const periodDays = insights.average_period_length || 5
  const cycleDay = Math.min(Math.max(cycleDayProp || insights.cycle_day || 1, 1), totalDays)
  const schedule = buildSchedule(totalDays, periodDays, insights.phase_ranges)

  const periodEnd = schedule.menstrual.end_day
  const predictedStart = Math.max(periodEnd + 1, totalDays - periodDays + 1)

  const markerAngle = dayCenterAngle(cycleDay, totalDays)
  const marker = polarToCartesian(CX, CY, RING, markerAngle)
  const periodIcon = polarToCartesian(CX, CY, RING, dayCenterAngle(1, totalDays))
  const fertileMid = polarToCartesian(
    CX,
    CY,
    RING,
    dayCenterAngle(schedule.ovulation_peak_day, totalDays),
  )
  const innerDots = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    const point = polarToCartesian(CX, CY, DOT_RING, dayCenterAngle(day, totalDays))
    const isToday = day === cycleDay
    const isPassed = day < cycleDay
    return {
      day,
      point,
      fill: isToday ? "#ffffff" : isPassed ? INNER_DOT_PASSED : INNER_DOT,
      radius: isToday ? 3.5 : 2.2,
    }
  })

  const dayNumbers = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    return {
      day,
      point: polarToCartesian(CX, CY, RING + 27, dayCenterAngle(day, totalDays)),
    }
  })

  const predictedDots = Array.from(
    { length: Math.max(0, totalDays - predictedStart + 1) },
    (_, index) => {
      const day = predictedStart + index
      return {
        day,
        point: polarToCartesian(CX, CY, RING, dayCenterAngle(day, totalDays)),
      }
    },
  )

  const phaseArcs = [
    {
      key: "menstrual",
      range: schedule.menstrual,
      color: PHASE_COLORS.menstrual,
    },
    {
      key: "follicular",
      range: schedule.follicular,
      color: PHASE_COLORS.follicular,
    },
    {
      key: "ovulation",
      range: schedule.ovulation,
      color: PHASE_COLORS.ovulation,
    },
    {
      key: "luteal",
      range: schedule.luteal,
      color: PHASE_COLORS.luteal,
    },
  ] as const

  const legendItems = phaseArcs.flatMap((phase) =>
    phase.range
      ? [{ key: phase.key, range: phase.range, color: phase.color }]
      : [],
  )

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative">
        <svg viewBox="0 0 400 400" className="h-auto w-full overflow-visible" aria-hidden>
          {/* Theme-colored phase wheel. Day 1 begins at 12 o'clock. */}
          <circle
            cx={CX}
            cy={CY}
            r={RING}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth={TRACK_WIDTH}
          />

          {phaseArcs.map((phase) =>
            phase.range ? (
              <motion.path
              key={phase.key}
              d={describeDayArc(
                CX,
                CY,
                RING,
                phase.range.start_day,
                phase.range.end_day,
                totalDays,
              )}
              fill="none"
              stroke={phase.color}
              strokeWidth={TRACK_WIDTH - 4}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            ) : null,
          )}

          {/* Predicted next period dots */}
          {predictedDots.map(({ day, point }) => (
            <circle key={`pred-${day}`} cx={point.x} cy={point.y} r={4.5} fill={PREDICTED_DOT} />
          ))}

        {/* Number every cycle day, as in a clinical cycle chart. */}
        {dayNumbers.map(({ day, point }) => (
          <text
            key={`day-number-${day}`}
            x={point.x}
            y={point.y}
            fill={day === cycleDay ? "#ffffff" : "rgba(255,255,255,0.66)"}
            fontSize={day === cycleDay ? 9 : 7.5}
            fontWeight={day === cycleDay ? 700 : 500}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {day}
          </text>
        ))}

        {/* Inner day dots — one per cycle day */}
        {innerDots.map(({ day, point, fill, radius }) => (
          <circle key={day} cx={point.x} cy={point.y} r={radius} fill={fill} />
        ))}

        {/* Period droplet at day 1 */}
        <foreignObject
          x={periodIcon.x - 14}
          y={periodIcon.y - 14}
          width={28}
          height={28}
          className="overflow-visible"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-[#cb0a7b] shadow-md">
            <Droplet className="size-3.5 fill-white text-white" strokeWidth={0} />
          </div>
        </foreignObject>

        {/* Fertile / ovulation marker */}
        <g transform={`translate(${fertileMid.x}, ${fertileMid.y})`}>
          <circle r={15} fill="#d946ef" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          <circle cx={-4} cy={-3} r={2.4} fill="#ffffff" />
          <circle cx={4} cy={-3} r={2.4} fill="#ffffff" />
          <circle cx={0} cy={4} r={2.4} fill="#ffffff" />
        </g>

        {/* Current day badge — sits on the ring, moves with cycle day */}
        <motion.foreignObject
          x={marker.x - 28}
          y={marker.y - 28}
          width={56}
          height={56}
          className="overflow-visible"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
        >
          <div className="flex size-14 flex-col items-center justify-center rounded-full bg-[#2c2c30] text-white shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            <span className="text-[10px] font-medium leading-none text-white/70">{dayWord}</span>
            <span className="mt-0.5 text-lg font-bold leading-none tabular-nums">{cycleDay}</span>
          </div>
        </motion.foreignObject>
        </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
        <motion.p
          className="text-sm font-medium text-white/70"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {todayLabel}
        </motion.p>
        <motion.p
          className="mt-3 max-w-[11rem] text-[1.35rem] font-bold leading-snug tracking-tight text-white md:max-w-[13rem] md:text-[1.55rem]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          {statusLabel}
        </motion.p>
      </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2 px-3">
        {legendItems.map((phase) => (
          <div
            key={phase.key}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: phase.color }}
            />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-white">
                {phaseLabels[phase.key]}
              </span>
              <span className="block text-[10px] text-white/55">
                {dayWord} {phase.range.start_day}–{phase.range.end_day}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
