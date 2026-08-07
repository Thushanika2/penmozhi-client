import apiClient from "@/lib/api-client"
import type { EducationVideo, EducationVideoListItem } from "@/types/education-video"

const VIDEO_UPLOAD_TIMEOUT_MS = 5 * 60_000

export interface EducationVideoListParams {
  category?: string
}

export interface UpdateEducationVideoPayload {
  title?: string
  description?: string | null
  category?: string
}

export async function getEducationVideos(params?: EducationVideoListParams) {
  const { data } = await apiClient.get<{ education_videos: EducationVideoListItem[] }>(
    "/api/education/videos",
    {
      params: {
        ...(params?.category ? { category: params.category } : {}),
      },
    },
  )
  return data
}

export async function getEducationVideo(id: number) {
  const { data } = await apiClient.get<{ education_video: EducationVideo }>(
    `/api/education/videos/${id}`,
  )
  return data
}

export async function getAdminEducationVideos(params?: EducationVideoListParams) {
  const { data } = await apiClient.get<{ education_videos: EducationVideo[] }>(
    "/admin/education/videos",
    {
      params: {
        ...(params?.category ? { category: params.category } : {}),
      },
    },
  )
  return data
}

export async function createEducationVideo(
  payload: {
    title: string
    description?: string
    category: string
    file: File
  },
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  formData.append("title", payload.title)
  if (payload.description) {
    formData.append("description", payload.description)
  }
  formData.append("category", payload.category)
  formData.append("video", payload.file)

  const { data } = await apiClient.post<{
    message: string
    education_video: EducationVideo
  }>("/admin/education/videos", formData, {
    timeout: VIDEO_UPLOAD_TIMEOUT_MS,
    headers: { "Content-Type": undefined as unknown as string },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
  return data
}

export async function updateEducationVideo(
  id: number,
  payload: UpdateEducationVideoPayload,
) {
  const { data } = await apiClient.put<{
    message: string
    education_video: EducationVideo
  }>(`/admin/education/videos/${id}`, payload)
  return data
}

export async function deleteEducationVideoEntry(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/admin/education/videos/${id}`,
  )
  return data
}
