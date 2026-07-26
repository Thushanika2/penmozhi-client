import apiClient from "@/lib/api-client"
import type { PCOSPatternsResponse } from "@/types/pcos-patterns"

export async function getPCOSPatterns() {
  const { data } = await apiClient.get<PCOSPatternsResponse>("/api/pcos-status/patterns")
  return data
}
