import apiClient from "@/lib/api-client"
import type { Subscription } from "@/types/subscription"

export async function getMySubscription() {
  const { data } = await apiClient.get<{ subscription: Subscription }>("/api/subscriptions/my")
  return data
}

export async function checkoutSubscription(plan = "plus") {
  const { data } = await apiClient.post<{ message: string; subscription: Subscription }>(
    "/api/subscriptions/checkout",
    { plan },
  )
  return data
}
