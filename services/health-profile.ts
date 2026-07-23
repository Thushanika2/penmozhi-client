import apiClient from "@/lib/api-client"
import type {
  BirthControlType,
  CycleRegularity,
  ExerciseFrequency,
  FlowLevel,
  HealthConditionOption,
  StressLevel,
  SymptomOption,
} from "@/types/onboarding"
import type { HealthProfile, HealthProfileRisks } from "@/types/health-profile"

export interface UpdateHealthProfilePayload {
  weight?: number | null
  height?: number | null
  nutritional_needs?: string | null
  health_risks?: string | null
  menarche_age?: number | null
  average_cycle_length?: number | null
  average_period_length?: number | null
  last_period_start?: string | null
  typical_flow?: FlowLevel | null
  cycle_regularity?: CycleRegularity | null
  common_symptoms?: SymptomOption[]
  health_conditions?: HealthConditionOption[]
  sleep_hours?: number | null
  water_intake_liters?: number | null
  exercise_frequency?: ExerciseFrequency | null
  stress_level?: StressLevel | null
  smoking?: boolean
  alcohol?: boolean
  trying_to_conceive?: boolean
  is_teenager?: boolean
  is_pregnant?: boolean
  is_breastfeeding?: boolean
  using_birth_control?: boolean
  birth_control_type?: BirthControlType | null
  notify_period?: boolean
  notify_ovulation?: boolean
  notify_medication?: boolean
  notify_daily_health?: boolean
}

export async function getHealthProfile(id: number) {
  const { data } = await apiClient.get<{ health_profile: HealthProfile }>(
    `/api/health-profiles/${id}`,
  )
  return data
}

export async function updateHealthProfile(
  id: number,
  payload: UpdateHealthProfilePayload,
) {
  const { data } = await apiClient.put<{
    message: string
    health_profile: HealthProfile
  }>(`/api/health-profiles/${id}`, payload)
  return data
}

export async function getHealthProfileRisks(id: number) {
  const { data } = await apiClient.get<HealthProfileRisks>(
    `/api/health-profiles/${id}/risks`,
  )
  return data
}
