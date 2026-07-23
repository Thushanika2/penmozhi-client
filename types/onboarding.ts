import type { LanguagePreference } from "@/types/user-profile"

export type FlowLevel = "light" | "medium" | "heavy" | "very_heavy"
export type CycleRegularity = "regular" | "irregular"
export type ExerciseFrequency = "never" | "rarely" | "weekly" | "daily"
export type StressLevel = "low" | "medium" | "high"
export type BirthControlType =
  | "none"
  | "pill"
  | "iud"
  | "implant"
  | "injection"
  | "condom"
  | "other"

export interface PeriodHistoryEntry {
  period_start: string
  flow: FlowLevel
}

export type SymptomOption =
  | "cramps"
  | "headache"
  | "acne"
  | "back_pain"
  | "mood_swings"
  | "tender_breasts"
  | "fatigue"
  | "bloating"
  | "nausea"
  | "cravings"
  | "no_symptoms"

export type HealthConditionOption =
  | "pcos"
  | "endometriosis"
  | "fibroids"
  | "anemia"
  | "thyroid"
  | "diabetes"
  | "hypertension"
  | "migraine"
  | "depression"
  | "anxiety"
  | "none"

export interface OnboardingPayload {
  full_name: string
  date_of_birth: string
  country: string
  height: number
  weight: number
  language_preference: LanguagePreference
  timezone: string
  knows_last_three_months: boolean
  period_history: PeriodHistoryEntry[]
  menarche_age?: number | null
  average_cycle_length: number
  average_period_length: number
  last_period_start: string
  typical_flow: FlowLevel
  cycle_regularity: CycleRegularity
  common_symptoms: SymptomOption[]
  health_conditions: HealthConditionOption[]
  sleep_hours: number
  water_intake_liters: number
  exercise_frequency: ExerciseFrequency
  stress_level: StressLevel
  smoking: boolean
  alcohol: boolean
  trying_to_conceive: boolean
  is_teenager: boolean
  is_pregnant: boolean
  is_breastfeeding: boolean
  using_birth_control: boolean
  birth_control_type: BirthControlType
  notify_period: boolean
  notify_ovulation: boolean
  notify_medication: boolean
  notify_daily_health: boolean
}

export interface OnboardingStatusResponse {
  onboarding_completed: boolean
  user: import("@/types/user-profile").UserProfile
  health_profile?: import("@/types/health-profile").HealthProfile
}
