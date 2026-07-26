export interface PerimenopauseLog {
  id: number
  profile_id: number
  log_date: string
  hot_flashes: boolean
  night_sweats: boolean
  mood_changes: string | null
  sleep_disruption: boolean
  notes: string | null
  created_at: string | null
}
