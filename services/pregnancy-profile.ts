import apiClient from "@/lib/api-client"
import type { PregnancyProfile } from "@/types/pregnancy-profile"

export async function getPregnancyProfile() {
  const { data } = await apiClient.get<{ pregnancy_profile: PregnancyProfile | null }>(
    "/api/pregnancy-profile",
  )
  return data
}

export async function updatePregnancyProfile(payload: { last_menstrual_period: string }) {
  const { data } = await apiClient.put<{ message: string; pregnancy_profile: PregnancyProfile }>(
    "/api/pregnancy-profile",
    payload,
  )
  return data
}
