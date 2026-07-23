import apiClient from "@/lib/api-client"
import type { AdminAnalytics, AdminExportType, AdminUsersResponse } from "@/types/admin"

export async function getAdminAnalytics(days = 30) {
  const { data } = await apiClient.get<AdminAnalytics>("/admin/analytics", {
    params: { days },
  })
  return data
}

export async function getAdminUsers(page = 1, search = "") {
  const { data } = await apiClient.get<AdminUsersResponse>("/admin/users", {
    params: { page, per_page: 20, search: search || undefined },
  })
  return data
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
