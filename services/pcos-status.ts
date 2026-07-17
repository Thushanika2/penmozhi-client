import apiClient from "@/lib/api-client"
import type { PCOSDisorderStatus, PCOSStatusHistory } from "@/types/pcos-status"

export interface UpdatePCOSStatusPayload {
  disorder_type?: string
  diagnosis_status?: string
  diagnosed_date?: string | null
}

export async function getMyPCOSStatuses() {
  const { data } = await apiClient.get<{ pcos_statuses: PCOSDisorderStatus[] }>(
    "/api/pcos-status/my",
  )
  return data
}

export async function updatePCOSStatus(id: number, payload: UpdatePCOSStatusPayload) {
  const { data } = await apiClient.put<{
    message: string
    pcos_status: PCOSDisorderStatus
  }>(`/api/pcos-status/${id}`, payload)
  return data
}

export async function getPCOSStatusHistory(id: number) {
  const { data } = await apiClient.get<PCOSStatusHistory>(
    `/api/pcos-status/${id}/history`,
  )
  return data
}
