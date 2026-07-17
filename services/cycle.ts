import apiClient from "@/lib/api-client"
import type { CycleHistoryLog, CyclePrediction } from "@/types/cycle-history-log"

export interface CreateCyclePayload {
  cycle_start_date: string
  cycle_end_date: string
  flow_intensity: string
}

export async function createCycle(payload: CreateCyclePayload) {
  const { data } = await apiClient.post<{
    message: string
    cycle: CycleHistoryLog
  }>("/api/cycles", payload)
  return data
}

export async function getMyCycles() {
  const { data } = await apiClient.get<{ cycles: CycleHistoryLog[] }>("/api/cycles/my")
  return data
}

export async function predictNextPeriod() {
  const { data } = await apiClient.get<CyclePrediction>("/api/cycles/predict-next")
  return data
}
