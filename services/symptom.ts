import apiClient from "@/lib/api-client"
import type {
  SymptomTrackingLog,
  SymptomTrends,
} from "@/types/symptom-tracking-log"

export interface CreateSymptomPayload {
  date_time?: string
  category: string
  pain_severity: number
  mood_status?: string | null
  sleep_metrics?: string | null
  disorder_status_id?: number | null
}

export async function createSymptom(payload: CreateSymptomPayload) {
  const { data } = await apiClient.post<{
    message: string
    symptom: SymptomTrackingLog
    ai_flag?: string | null
  }>("/api/symptoms", payload)
  return data
}

export async function getMySymptoms() {
  const { data } = await apiClient.get<{ symptoms: SymptomTrackingLog[] }>(
    "/api/symptoms/my",
  )
  return data
}

export async function getSymptomTrends() {
  const { data } = await apiClient.get<SymptomTrends>("/api/symptoms/trends")
  return data
}
