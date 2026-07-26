export interface Subscription {
  id?: number
  profile_id?: number
  plan: "free" | "plus"
  status: string
  current_period_end: string | null
  created_at?: string | null
}
