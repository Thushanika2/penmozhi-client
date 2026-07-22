export interface CycleHistoryLog {
  id: number
  profile_id: number
  cycle_start_date: string
  cycle_end_date: string
  flow_intensity: string
  predicted_next_period_date: string | null
  created_at: string | null
}

export interface CyclePrediction {
  predicted_next_period_date: string | null
  message?: string
  message_code?: string
  based_on_cycles?: number
  latest_cycle?: CycleHistoryLog
}
