import apiClient from "@/lib/api-client"
import type { CycleCalendarData, DailyLog, DailyLogPayload } from "@/types/daily-log"

export async function getMyDailyLogs(from?: string, to?: string) {
  const { data } = await apiClient.get<{ daily_logs: DailyLog[] }>("/api/daily-logs/my", {
    params: { from, to },
  })
  return data
}

export async function getDailyLogByDate(logDate: string) {
  const { data } = await apiClient.get<{ daily_log: DailyLog | null }>(
    `/api/daily-logs/date/${logDate}`,
  )
  return data
}

export async function upsertDailyLog(payload: DailyLogPayload) {
  const { data } = await apiClient.post<{ message: string; daily_log: DailyLog }>(
    "/api/daily-logs",
    payload,
  )
  return data
}

export async function updateDailyLog(id: number, payload: Partial<DailyLogPayload>) {
  const { data } = await apiClient.put<{ message: string; daily_log: DailyLog }>(
    `/api/daily-logs/${id}`,
    payload,
  )
  return data
}

export async function deleteDailyLog(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(`/api/daily-logs/${id}`)
  return data
}

export async function getCycleCalendar(year: number, month: number) {
  const { data } = await apiClient.get<CycleCalendarData>("/api/cycles/calendar", {
    params: { year, month },
  })
  return data
}
