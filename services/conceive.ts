import apiClient from "@/lib/api-client"
import type { ConceiveInsights } from "@/types/conceive-insights"

export async function getConceiveInsights() {
  const { data } = await apiClient.get<ConceiveInsights>("/api/cycles/predict-conceive")
  return data
}
