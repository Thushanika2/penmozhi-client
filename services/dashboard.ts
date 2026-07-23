import apiClient from "@/lib/api-client"
import type { DashboardSummary } from "@/types/dashboard"

export async function getDashboardSummary() {
  const { data } = await apiClient.get<DashboardSummary>("/api/dashboard/summary")
  return data
}
