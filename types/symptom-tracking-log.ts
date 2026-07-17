export interface SymptomTrackingLog {
  id: number
  profile_id: number
  date_time: string
  category: string
  pain_severity: number
  mood_status: string | null
  sleep_metrics: string | null
  disorder_status_id: number | null
  created_at: string | null
}

export interface SymptomTrendPoint {
  date?: string
  category?: string
  count: number
  avg_pain: number
}

export interface SymptomTrends {
  date_trends: SymptomTrendPoint[]
  category_trends: SymptomTrendPoint[]
  total_entries: number
}
