import apiClient from "@/lib/api-client"
import type { HealthInsights } from "@/types/insights"

export async function getHealthInsights(months = 6) {
  const { data } = await apiClient.get<HealthInsights>("/api/insights", {
    params: { months },
  })
  return data
}
