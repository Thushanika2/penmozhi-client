export interface PregnancyProfile {
  id: number
  profile_id: number
  last_menstrual_period: string | null
  due_date: string | null
  current_trimester: number | null
  created_at: string | null
  updated_at: string | null
}
