import type {
  BirthControlType,
  CycleRegularity,
  ExerciseFrequency,
  FlowLevel,
  HealthConditionOption,
  StressLevel,
  SymptomOption,
} from "@/types/onboarding"
import type { LanguagePreference } from "@/types/user-profile"

export interface HealthProfile {
  id: number
  profile_id: number
  weight: number | null
  height: number | null
  calculated_bmi: number | null
  nutritional_needs: string | null
  health_risks: string | null
  menarche_age: number | null
  average_cycle_length: number | null
  average_period_length: number | null
  last_period_start: string | null
  typical_flow: FlowLevel | null
  cycle_regularity: CycleRegularity | null
  common_symptoms: SymptomOption[]
  health_conditions: HealthConditionOption[]
  sleep_hours: number | null
  water_intake_liters: number | null
  exercise_frequency: ExerciseFrequency | null
  stress_level: StressLevel | null
  smoking: boolean
  alcohol: boolean
  trying_to_conceive: boolean
  is_pregnant: boolean
  is_breastfeeding: boolean
  using_birth_control: boolean
  birth_control_type: BirthControlType | null
  notify_period: boolean
  notify_ovulation: boolean
  notify_medication: boolean
  notify_daily_health: boolean
  created_at: string | null
  updated_at: string | null
}

export interface HealthProfileRisks {
  health_risks: string | null
  calculated_bmi: number | null
  bmi_category: string | null
  nutritional_needs: string | null
}
