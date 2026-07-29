export type LanguagePreference = "tamil" | "english"
export type UserRole = "user" | "admin"
export type TrackingMode =
  | "period"
  | "conceive"
  | "pregnancy"
  | "perimenopause"
  | "non_bleeding"

export type UserStatus = "active" | "suspended" | "banned"
export type SubscriptionLabel = "free" | "premium" | "trial" | "expired"

export interface UserProfile {
  id: number
  full_name: string
  date_of_birth: string | null
  email: string
  language_preference: LanguagePreference
  country: string | null
  timezone: string
  onboarding_completed: boolean
  role: UserRole
  status: UserStatus
  is_test_account: boolean
  last_active_at: string | null
  login_count: number
  registration_date: string | null
  mode: TrackingMode
  has_app_lock: boolean
  subscription?: SubscriptionLabel
}
