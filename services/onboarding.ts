import apiClient from "@/lib/api-client"
import type { HealthProfile } from "@/types/health-profile"
import type { OnboardingPayload, OnboardingStatusResponse } from "@/types/onboarding"
import type { UserProfile } from "@/types/user-profile"

export async function getOnboardingStatus() {
  const { data } = await apiClient.get<OnboardingStatusResponse>("/api/onboarding/status")
  return data
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const { data } = await apiClient.post<{
    message: string
    user: UserProfile
    health_profile: HealthProfile
  }>("/api/onboarding/complete", payload)
  return data
}
