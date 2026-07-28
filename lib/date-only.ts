import type { Locale } from "@/i18n/config"

/** Build a timezone-safe YYYY-MM-DD string from calendar parts (month is 1–12). */
export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number)
  return { year, month, day }
}

/** Format a YYYY-MM-DD string for display without local timezone drift. */
export function formatDateKey(dateKey: string, locale: Locale): string {
  const { year, month, day } = parseDateKey(dateKey)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    locale === "ta" ? "ta-IN" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  )
}

export function formatMonthYear(year: number, month: number, locale: Locale): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    locale === "ta" ? "ta-IN" : "en-GB",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  )
}

export function todayDateKey(): string {
  const now = new Date()
  return toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function isFutureDateKey(dateKey: string): boolean {
  return dateKey > todayDateKey()
}

/** Sort ISO date strings newest first. */
export function compareDateKeysDesc(a: string, b: string): number {
  return b.localeCompare(a)
}

/** Subtract calendar days from a YYYY-MM-DD string (UTC-safe, no timezone drift). */
export function subtractDaysFromDateKey(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey)
  const utcMs = Date.UTC(year, month - 1, day) - days * 86_400_000
  const result = new Date(utcMs)
  return toDateKey(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate())
}

/** Build up to `maxEntries` period start dates counting backward by cycle length. */
export function buildSuggestedPeriodDates(
  anchorDateKey: string,
  cycleLengthDays: number,
  maxEntries = 3,
): string[] {
  if (cycleLengthDays <= 0 || !Number.isFinite(cycleLengthDays)) return [anchorDateKey]

  const dates = [anchorDateKey]
  let current = anchorDateKey

  for (let index = 1; index < maxEntries; index += 1) {
    const previous = subtractDaysFromDateKey(current, cycleLengthDays)
    if (isFutureDateKey(previous)) break
    dates.push(previous)
    current = previous
  }

  return dates
}
