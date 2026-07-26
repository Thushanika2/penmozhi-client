import apiClient from "@/lib/api-client"

export async function registerPushSubscription(payload: {
  endpoint: string
  p256dh: string
  auth: string
  device_type?: string
}) {
  const { data } = await apiClient.post<{ message: string; push_subscription: { id: number } }>(
    "/api/push-subscriptions",
    payload,
  )
  return data
}

export async function deletePushSubscription(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(`/api/push-subscriptions/${id}`)
  return data
}

export async function exportAccountData() {
  const response = await apiClient.get("/api/account/export", { responseType: "blob" })
  return response.data as Blob
}
