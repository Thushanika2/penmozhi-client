export interface WearableConnection {
  id: number
  profile_id: number
  provider: string
  last_synced_at: string | null
  created_at: string | null
}
