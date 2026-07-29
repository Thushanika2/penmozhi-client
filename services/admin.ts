import apiClient from "@/lib/api-client"
import type {
  AdminAnalytics,
  AdminCompletePrivacyRequestResponse,
  AdminExportType,
  AdminPrivacyIntegrationsResponse,
  AdminPrivacyRequestsResponse,
  AdminRequestDeleteResponse,
  AdminTestAccountCandidatesResponse,
  AdminUserConsentsResponse,
  AdminUserDetailResponse,
  AdminUsersFilters,
  AdminUsersResponse,
} from "@/types/admin"

export async function getAdminAnalytics(days = 30) {
  const { data } = await apiClient.get<AdminAnalytics>("/admin/analytics", {
    params: { days },
  })
  return data
}

export async function getAdminUsers(filters: AdminUsersFilters = {}) {
  const {
    page = 1,
    search = "",
    status = "all",
    subscription = "all",
    onboarding = "all",
    hideTestAccounts = true,
  } = filters

  const { data } = await apiClient.get<AdminUsersResponse>("/admin/users", {
    params: {
      page,
      per_page: 20,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      subscription: subscription === "all" ? undefined : subscription,
      onboarding: onboarding === "all" ? undefined : onboarding,
      hide_test_accounts: hideTestAccounts ? "true" : "false",
    },
  })
  return data
}

export async function getAdminUserDetail(userId: number) {
  const { data } = await apiClient.get<AdminUserDetailResponse>(`/admin/users/${userId}`)
  return data
}

export async function toggleAdminUserSuspend(userId: number) {
  const { data } = await apiClient.post<{ message: string; user: AdminUserDetailResponse["user"] }>(
    `/admin/users/${userId}/toggle-suspend`,
  )
  return data
}

export async function updateAdminUserStatus(
  userId: number,
  status: "active" | "suspended" | "banned",
) {
  const { data } = await apiClient.patch<{ message: string; user: AdminUserDetailResponse["user"] }>(
    `/admin/users/${userId}/status`,
    { status },
  )
  return data
}

export async function forceAdminUserLogout(userId: number) {
  const { data } = await apiClient.post<{ message: string }>(
    `/admin/users/${userId}/force-logout`,
  )
  return data
}

export async function requestAdminUserDelete(userId: number) {
  const { data } = await apiClient.post<AdminRequestDeleteResponse>(
    `/admin/users/${userId}/request-delete`,
  )
  return data
}

export async function toggleAdminUserTestAccount(userId: number, isTestAccount: boolean) {
  const { data } = await apiClient.patch<{ message: string; user: AdminUserDetailResponse["user"] }>(
    `/admin/users/${userId}/test-account`,
    { is_test_account: isTestAccount },
  )
  return data
}

export async function getAdminTestAccountCandidates() {
  const { data } = await apiClient.get<AdminTestAccountCandidatesResponse>(
    "/admin/users/test-candidates",
  )
  return data
}

export async function downloadAdminBulkUserExport(userIds: number[]) {
  const response = await apiClient.post("/admin/users/bulk-export", { user_ids: userIds }, {
    responseType: "blob",
  })
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "penmozhi-selected-users.csv"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadAdminExport(type: AdminExportType) {
  const response = await apiClient.get(`/admin/export/${type}`, {
    responseType: "blob",
  })
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `penmozhi-${type}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function getAdminPrivacyRequests(status?: string) {
  const { data } = await apiClient.get<AdminPrivacyRequestsResponse>("/admin/privacy/requests", {
    params: status ? { status } : undefined,
  })
  return data
}

export async function completeAdminPrivacyRequest(requestId: number) {
  const { data } = await apiClient.post<AdminCompletePrivacyRequestResponse>(
    `/admin/privacy/requests/${requestId}/complete`,
  )
  return data
}

export async function getAdminPrivacyIntegrations() {
  const { data } = await apiClient.get<AdminPrivacyIntegrationsResponse>(
    "/admin/privacy/integrations",
  )
  return data
}

export async function getAdminUserConsents(userId: number) {
  const { data } = await apiClient.get<AdminUserConsentsResponse>(
    `/admin/privacy/consents/${userId}`,
  )
  return data
}
