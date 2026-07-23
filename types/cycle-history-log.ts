export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "fertile"
  | "ovulation"
  | "luteal"
  | "pms"

export interface CycleStatistics {
  average_cycle_length: number | null
  average_period_length: number | null
  longest_cycle: number | null
  shortest_cycle: number | null
  logged_cycles: number
}

export interface CycleInsights {
  has_data: boolean
  cycle_day: number | null
  current_phase: CyclePhase | null
  last_period_start: string | null
  next_period_date: string | null
  ovulation_date: string | null
  fertile_window_start: string | null
  fertile_window_end: string | null
  pms_window_start: string | null
  pms_window_end: string | null
  days_until_next_period: number | null
  average_cycle_length: number
  average_period_length: number
  statistics: CycleStatistics
}

export interface CyclePrediction {
  predicted_next_period_date: string | null
  ovulation_date?: string | null
  fertile_window_start?: string | null
  fertile_window_end?: string | null
  pms_window_start?: string | null
  pms_window_end?: string | null
  cycle_day?: number | null
  current_phase?: CyclePhase | null
  days_until_next_period?: number | null
  message?: string
  message_code?: string
  based_on_cycles?: number
  latest_cycle?: import("./cycle-history-log").CycleHistoryLog
}

export interface CycleHistoryLog {
  id: number
  profile_id: number
  cycle_start_date: string
  cycle_end_date: string
  flow_intensity: string
  notes: string | null
  predicted_next_period_date: string | null
  created_at: string | null
}
