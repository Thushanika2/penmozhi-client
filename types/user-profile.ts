export type LanguagePreference = "tamil" | "english"
export type UserRole = "user" | "admin"

export interface UserProfile {
  id: number
  full_name: string
  date_of_birth: string
  email: string
  language_preference: LanguagePreference
  role: UserRole
  registration_date: string | null
}
