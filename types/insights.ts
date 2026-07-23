import type { CycleStatistics } from "./cycle-history-log"
import type { SymptomTrends } from "./symptom-tracking-log"

export interface CycleLengthPoint {
  start_date: string
  cycle_length: number
}

export interface PeriodLengthPoint {
  start_date: string
  period_length: number
}

export interface DailyPainPoint {
  date: string
  score: number
  level: string
}

export interface SleepPoint {
  date: string
  hours: number
}

export interface EnergyPoint {
  date: string
  score: number
  level: string
}

export interface MoodFrequencyPoint {
  mood: string
  count: number
}

export interface MoodTimelinePoint {
  date: string
  primary_mood: string
  entry_count: number
}

export interface HealthInsights {
  months: number
  has_cycle_data: boolean
  has_daily_log_data: boolean
  has_symptom_data: boolean
  cycle_statistics: CycleStatistics
  cycle_length_trend: CycleLengthPoint[]
  period_length_trend: PeriodLengthPoint[]
  symptom_trends: SymptomTrends
  daily_pain_trend: DailyPainPoint[]
  sleep_trend: SleepPoint[]
  energy_trend: EnergyPoint[]
  mood_frequency: MoodFrequencyPoint[]
  mood_timeline: MoodTimelinePoint[]
  total_daily_logs: number
}
