import apiClient from "@/lib/api-client"
import type { CycleShare, CycleShareViewData } from "@/types/cycle-share"

export async function createCycleShare(payload: {
  shared_with_email: string
  permissions?: Record<string, boolean>
}) {
  const { data } = await apiClient.post<{ message: string; cycle_share: CycleShare }>(
    "/api/cycle-shares",
    payload,
  )
  return data
}

export async function getCycleShares() {
  const { data } = await apiClient.get<{ cycle_shares: CycleShare[] }>("/api/cycle-shares")
  return data
}

export async function acceptCycleShare(id: number) {
  const { data } = await apiClient.post<{ message: string; cycle_share: CycleShare }>(
    `/api/cycle-shares/${id}/accept`,
  )
  return data
}

export async function revokeCycleShare(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(`/api/cycle-shares/${id}`)
  return data
}

export async function viewCycleShare(id: number) {
  const { data } = await apiClient.get<CycleShareViewData>(`/api/cycle-shares/${id}/view`)
  return data
}
