export interface AdminAnalyticsSummary {
  total_users: number
  total_admins: number
  onboarding_completed: number
  onboarding_rate: number
  english_users: number
  tamil_users: number
  pcos_users: number
  recent_active_users: number
  cycles: number
  symptoms: number
  daily_logs: number
  forum_posts: number
  reminders: number
  education_articles: number
}

export interface AdminRegistrationTrendPoint {
  date: string
  registrations: number
}

export interface AdminActivityTrendPoint {
  date: string
  cycles: number
  symptoms: number
  daily_logs: number
}

export interface AdminAnalytics {
  days: number
  summary: AdminAnalyticsSummary
  registration_trend: AdminRegistrationTrendPoint[]
  activity_trend: AdminActivityTrendPoint[]
}

export interface AdminUsersResponse {
  users: import("./user-profile").UserProfile[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
  }
}

export type AdminExportType = "users" | "cycles" | "symptoms" | "daily_logs" | "summary"
