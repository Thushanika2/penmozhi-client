export type LanguagePreference = "tamil" | "english"
export type UserRole = "user" | "admin"

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
}
