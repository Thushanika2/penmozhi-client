import apiClient from "@/lib/api-client"
import type { TrackingCategory } from "@/types/tracking-category"

export async function getTrackingCategories(group?: string) {
  const { data } = await apiClient.get<{ tracking_categories: TrackingCategory[] }>(
    "/api/tracking-categories",
    { params: group ? { group } : undefined },
  )
  return data
}
