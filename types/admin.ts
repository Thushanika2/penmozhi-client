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

export interface AdminUsersFilters {
  page?: number
  search?: string
  status?: "all" | "active" | "suspended" | "banned"
  subscription?: "all" | "free" | "premium"
  onboarding?: "all" | "complete" | "pending"
  hideTestAccounts?: boolean
}

export interface AdminUserDetailSubscription {
  plan: string
  status: string
  label: import("./user-profile").SubscriptionLabel
  current_period_end: string | null
  created_at: string | null
}

export interface AdminUserDetailActivity {
  last_active_at: string | null
  login_count: number
  onboarding_completed: boolean
}

export interface AdminUserDetailPaymentHistory {
  implemented: boolean
  message: string
  records: unknown[]
}

export interface AdminActionLogEntry {
  id: number
  admin_id: number
  admin_email: string | null
  action_type: string
  target_user_id: number | null
  timestamp: string | null
  notes: string | null
}

export interface AdminUserDetailResponse {
  user: import("./user-profile").UserProfile
  subscription: AdminUserDetailSubscription
  payment_history: AdminUserDetailPaymentHistory
  activity: AdminUserDetailActivity
  consents: AdminUserConsent[]
  admin_action_logs: AdminActionLogEntry[]
}

export interface AdminRequestDeleteResponse {
  message: string
  privacy_request_id: number
  redirect_path: string
}

export interface AdminTestAccountCandidate {
  id: number
  email: string
  full_name: string
  is_test_account: boolean
  registration_date: string | null
}

export interface AdminTestAccountCandidatesResponse {
  candidates: AdminTestAccountCandidate[]
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
