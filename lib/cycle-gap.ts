/** Typical cycle bounds — keep in sync with API cycle_prediction_service. */
export const MIN_CYCLE_LENGTH = 21
export const MAX_TYPICAL_CYCLE_LENGTH = 45
export const UNUSUAL_GAP_DAYS = MAX_TYPICAL_CYCLE_LENGTH + 1

export const GAP_REASON_OPTIONS = [
  "medication",
  "medical",
  "stress",
  "missed_logging",
  "contraception",
  "pregnancy_postpartum",
  "other",
] as const

export type GapReason = (typeof GAP_REASON_OPTIONS)[number]

export function daysBetweenDateKeys(earlier: string, later: string): number {
  const [y1, m1, d1] = earlier.split("-").map(Number)
  const [y2, m2, d2] = later.split("-").map(Number)
  const a = Date.UTC(y1, m1 - 1, d1)
  const b = Date.UTC(y2, m2 - 1, d2)
  return Math.round((b - a) / 86_400_000)
}

export function isUnusualGap(gapDays: number): boolean {
  return gapDays >= UNUSUAL_GAP_DAYS
}

export function findUnusualGapBefore(
  existingStarts: string[],
  newStart: string,
): { previousStart: string; newStart: string; gapDays: number } | null {
  if (!newStart) return null
  const prior = existingStarts.filter((start) => start < newStart)
  if (!prior.length) return null
  const previousStart = prior.reduce((a, b) => (a > b ? a : b))
  const gapDays = daysBetweenDateKeys(previousStart, newStart)
  if (!isUnusualGap(gapDays)) return null
  return { previousStart, newStart, gapDays }
}

export function countTypicalGaps(starts: string[]): number {
  const ordered = [...starts].sort()
  let count = 0
  for (let i = 1; i < ordered.length; i += 1) {
    const gap = daysBetweenDateKeys(ordered[i - 1], ordered[i])
    if (gap >= MIN_CYCLE_LENGTH && gap <= MAX_TYPICAL_CYCLE_LENGTH) {
      count += 1
    }
  }
  return count
}
