import apiClient from "@/lib/api-client"
import type { EducationalResource } from "@/types/educational-resource"

export interface CreateEducationPayload {
  article_title: string
  content_category: string
  content_body: string
  publication_date: string
  language?: "english" | "tamil"
}

export interface UpdateEducationPayload {
  article_title?: string
  content_category?: string
  content_body?: string
  publication_date?: string
  language?: "english" | "tamil"
}

export interface EducationListParams {
  category?: string
  language?: "english" | "tamil"
}

const VIDEO_UPLOAD_TIMEOUT_MS = 5 * 60_000

export async function getEducationResources(params?: EducationListParams) {
  const { data } = await apiClient.get<{ education_resources: EducationalResource[] }>(
    "/api/education",
    {
      params: {
        ...(params?.category ? { category: params.category } : {}),
        ...(params?.language ? { language: params.language } : {}),
      },
    },
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

export async function uploadEducationVideo(
  id: number,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  formData.append("video", file)

  const { data } = await apiClient.post<{
    message: string
    education_resource: EducationalResource
  }>(`/admin/education/${id}/video`, formData, {
    timeout: VIDEO_UPLOAD_TIMEOUT_MS,
    // Let the browser set multipart boundary (default JSON Content-Type breaks uploads).
    headers: { "Content-Type": undefined as unknown as string },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
  return data
}

export async function deleteEducationVideo(id: number) {
  const { data } = await apiClient.delete<{
    message: string
    education_resource: EducationalResource
  }>(`/admin/education/${id}/video`)
  return data
}
