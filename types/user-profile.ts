export type LanguagePreference = "tamil" | "english"
export type UserRole = "user" | "admin"
export type TrackingMode =
  | "period"
  | "conceive"
  | "pregnancy"
  | "perimenopause"
  | "non_bleeding"

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
  registration_date: string | null
  mode: TrackingMode
  has_app_lock: boolean
}
