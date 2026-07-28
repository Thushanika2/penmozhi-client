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

export interface AdminPrivacyRequest {
  id: number
  user_id: number | null
  user_email: string
  request_type: "export" | "delete"
  status: "pending" | "processing" | "completed"
  created_at: string | null
  completed_at: string | null
  completed_by_admin_id: number | null
  completed_by_admin_email: string | null
}

export interface AdminPrivacyRequestsResponse {
  privacy_requests: AdminPrivacyRequest[]
}

export interface AdminPrivacyIntegration {
  provider: string
  integration_type: string
  data_categories: string[]
  connected_users: number
  status: string
}

export interface AdminPrivacyIntegrationsResponse {
  integrations: AdminPrivacyIntegration[]
}

export interface AdminUserConsent {
  id: number
  user_id: number
  consent_type: string
  policy_version: string
  granted_at: string | null
  context: string | null
}

export interface AdminUserConsentsResponse {
  user_id: number
  user_email: string
  consents: AdminUserConsent[]
}

export interface AdminCompletePrivacyRequestResponse {
  message: string
  privacy_request: AdminPrivacyRequest
  deletion_approach: string
  tables_affected: string[]
}

export type AdminExportType = "users" | "cycles" | "symptoms" | "daily_logs" | "summary"
