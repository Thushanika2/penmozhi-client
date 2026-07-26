import apiClient from "@/lib/api-client"
import type { WearableConnection } from "@/types/wearable-connection"

export async function getMyWearables() {
  const { data } = await apiClient.get<{ wearable_connections: WearableConnection[] }>(
    "/api/wearables/my",
  )
  return data
}

export async function connectWearable(provider: string) {
  const { data } = await apiClient.get<{ redirect_url?: string; provider: string }>(
    `/api/wearables/${provider}/connect`,
  )
  return data
}

export async function disconnectWearable(provider: string) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/api/wearables/${provider}/disconnect`,
  )
  return data
}
