import apiClient from "@/lib/api-client"
import type { PerimenopauseLog } from "@/types/perimenopause-log"

export async function createPerimenopauseLog(payload: {
  log_date: string
  hot_flashes?: boolean
  night_sweats?: boolean
  mood_changes?: string | null
  sleep_disruption?: boolean
  notes?: string | null
}) {
  const { data } = await apiClient.post<{ message: string; perimenopause_log: PerimenopauseLog }>(
    "/api/perimenopause-logs",
    payload,
  )
  return data
}

export async function getMyPerimenopauseLogs(from?: string, to?: string) {
  const { data } = await apiClient.get<{ perimenopause_logs: PerimenopauseLog[] }>(
    "/api/perimenopause-logs/my",
    { params: { from, to } },
  )
  return data
}

export async function updatePerimenopauseLog(
  id: number,
  payload: Partial<{
    log_date: string
    hot_flashes: boolean
    night_sweats: boolean
    mood_changes: string | null
    sleep_disruption: boolean
    notes: string | null
  }>,
) {
  const { data } = await apiClient.put<{ message: string; perimenopause_log: PerimenopauseLog }>(
    `/api/perimenopause-logs/${id}`,
    payload,
  )
  return data
}
