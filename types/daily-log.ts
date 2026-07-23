export type FlowLevel = "none" | "spotting" | "light" | "medium" | "heavy"
export type PainLevel = "none" | "mild" | "moderate" | "severe"
export type EnergyLevel = "low" | "medium" | "high"
export type CervicalFluid = "dry" | "sticky" | "creamy" | "egg_white"
export type ExerciseLevel = "none" | "light" | "moderate" | "intense"

export interface DailyLog {
  id: number
  profile_id: number
  log_date: string
  flow_level: FlowLevel | null
  pain_level: PainLevel | null
  mood: string | null
  energy: EnergyLevel | null
  sleep_hours: number | null
  exercise: ExerciseLevel | null
  weight: number | null
  basal_temp: number | null
  cervical_fluid: CervicalFluid | null
  sexual_activity: boolean
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DailyLogPayload {
  log_date: string
  flow_level?: FlowLevel
  pain_level?: PainLevel
  mood?: string | null
  energy?: EnergyLevel | null
  sleep_hours?: number | null
  exercise?: ExerciseLevel | null
  weight?: number | null
  basal_temp?: number | null
  cervical_fluid?: CervicalFluid | null
  sexual_activity?: boolean
  notes?: string | null
}

export interface CycleCalendarData {
  year: number
  month: number
  period_days: string[]
  predicted_period_days: string[]
  fertile_days: string[]
  ovulation_days: string[]
  pms_days: string[]
  daily_logs: DailyLog[]
  insights: import("./cycle-history-log").CycleInsights
}
