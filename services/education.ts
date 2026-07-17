import apiClient from "@/lib/api-client"
import type { EducationalResource } from "@/types/educational-resource"

export interface CreateEducationPayload {
  article_title: string
  content_category: string
  content_body: string
  publication_date: string
}

export interface UpdateEducationPayload {
  article_title?: string
  content_category?: string
  content_body?: string
  publication_date?: string
}

export async function getEducationResources(category?: string) {
  const { data } = await apiClient.get<{ education_resources: EducationalResource[] }>(
    "/api/education",
    { params: category ? { category } : undefined },
  )
  return data
}

export async function getEducationResource(id: number) {
  const { data } = await apiClient.get<{ education_resource: EducationalResource }>(
    `/api/education/${id}`,
  )
  return data
}

export async function createEducationResource(payload: CreateEducationPayload) {
  const { data } = await apiClient.post<{
    message: string
    education_resource: EducationalResource
  }>("/api/education", payload)
  return data
}

export async function updateEducationResource(
  id: number,
  payload: UpdateEducationPayload,
) {
  const { data } = await apiClient.put<{
    message: string
    education_resource: EducationalResource
  }>(`/api/education/${id}`, payload)
  return data
}

export async function deleteEducationResource(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/api/education/${id}`,
  )
  return data
}
