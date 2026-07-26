export interface CycleShare {
  id: number
  owner_profile_id: number
  shared_with_email: string
  shared_with_profile_id: number | null
  status: "pending" | "accepted" | "revoked"
  permissions: Record<string, boolean>
  created_at: string | null
}

export interface CycleShareViewData {
  cycle_share: CycleShare
  owner_name: string
  cycles?: Record<string, unknown>[]
  symptoms?: Record<string, unknown>[]
  daily_logs?: Record<string, unknown>[]
}
