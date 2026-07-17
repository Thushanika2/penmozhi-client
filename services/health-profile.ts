import apiClient from "@/lib/api-client"
import type { HealthProfile, HealthProfileRisks } from "@/types/health-profile"

export interface UpdateHealthProfilePayload {
  weight?: number | null
  height?: number | null
  nutritional_needs?: string | null
  health_risks?: string | null
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
