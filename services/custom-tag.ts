import apiClient from "@/lib/api-client"
import type { CustomTag } from "@/types/custom-tag"

export async function createCustomTag(payload: { label: string; icon?: string | null }) {
  const { data } = await apiClient.post<{ message: string; custom_tag: CustomTag }>(
    "/api/custom-tags",
    payload,
  )
  return data
}

export async function getMyCustomTags() {
  const { data } = await apiClient.get<{ custom_tags: CustomTag[] }>("/api/custom-tags/my")
  return data
}

export async function updateCustomTag(id: number, payload: { label?: string; icon?: string | null }) {
  const { data } = await apiClient.put<{ message: string; custom_tag: CustomTag }>(
    `/api/custom-tags/${id}`,
    payload,
  )
  return data
}

export async function deleteCustomTag(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(`/api/custom-tags/${id}`)
  return data
}
