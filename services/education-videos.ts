import axios from "axios"

import apiClient from "@/lib/api-client"
import { VideoUploadError } from "@/lib/video-upload-error"
import type {
  EducationVideo,
  EducationVideoListItem,
} from "@/types/education-video"

const CLOUDINARY_CHUNK_BYTES = 6_000_000
const CLOUDINARY_CHUNK_TIMEOUT_MS = 2 * 60_000

interface DirectUploadConfig {
  api_key: string
  cloud_name: string
  folder: string
  signature: string
  timestamp: number
}

interface CloudinaryUploadResult {
  bytes: number
  done?: boolean
  public_id: string
  resource_type: "video"
  secure_url: string
  signature: string
  version: number
}

function cloudinaryErrorDetail(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined
  const data = error.response?.data
  if (!data || typeof data !== "object") return undefined
  const providerError = (data as { error?: { message?: unknown } }).error
  return typeof providerError?.message === "string"
    ? providerError.message
    : undefined
}

function normalizeCloudinaryError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const detail = cloudinaryErrorDetail(error)
    if (error.response?.status === 413) {
      throw new VideoUploadError(
        "too_large",
        "The video exceeds the configured Cloudinary upload limit.",
        detail
      )
    }
    if (
      error.code === "ECONNABORTED" ||
      error.message.toLowerCase().includes("timeout")
    ) {
      throw new VideoUploadError(
        "timeout",
        "The video upload timed out.",
        detail
      )
    }
    if (!error.response) {
      throw new VideoUploadError(
        "network",
        "The browser lost its connection to the video host."
      )
    }
    throw new VideoUploadError(
      "provider_rejected",
      "Cloudinary rejected the video upload.",
      detail
    )
  }
  throw error
}

async function uploadVideoDirectly(
  file: File,
  config: DirectUploadConfig,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    config.cloud_name
  )}/video/upload`
  const uploadId = crypto.randomUUID()
  let finalResult: CloudinaryUploadResult | undefined

  for (let start = 0; start < file.size; start += CLOUDINARY_CHUNK_BYTES) {
    const end = Math.min(start + CLOUDINARY_CHUNK_BYTES, file.size)
    const formData = new FormData()
    formData.append("file", file.slice(start, end), file.name)
    formData.append("api_key", config.api_key)
    formData.append("timestamp", String(config.timestamp))
    formData.append("signature", config.signature)
    formData.append("folder", config.folder)

    try {
      const { data } = await axios.post<CloudinaryUploadResult>(
        uploadUrl,
        formData,
        {
          timeout: CLOUDINARY_CHUNK_TIMEOUT_MS,
          headers: {
            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
            "X-Unique-Upload-Id": uploadId,
          },
          onUploadProgress: (event) => {
            if (!onProgress) return
            const chunkLoaded = Math.min(event.loaded, end - start)
            onProgress(
              Math.min(
                99,
                Math.round(((start + chunkLoaded) / file.size) * 100)
              )
            )
          },
        }
      )
      finalResult = data
    } catch (error) {
      normalizeCloudinaryError(error)
    }
  }

  if (
    !finalResult?.public_id ||
    !finalResult.secure_url ||
    !finalResult.signature
  ) {
    throw new VideoUploadError(
      "provider_rejected",
      "Cloudinary returned an incomplete upload response."
    )
  }
  return finalResult
}

export async function uploadEducationVideoFileDirectly(
  file: File,
  onProgress?: (percent: number) => void
) {
  const { data } = await apiClient.post<{ upload: DirectUploadConfig }>(
    "/admin/education/videos/upload-signature",
    {}
  )
  return uploadVideoDirectly(file, data.upload, onProgress)
}

export interface EducationVideoListParams {
  category?: string
}

export interface UpdateEducationVideoPayload {
  title?: string
  description?: string | null
  category?: string
}

export async function getEducationVideos(params?: EducationVideoListParams) {
  const { data } = await apiClient.get<{
    education_videos: EducationVideoListItem[]
  }>("/api/education/videos", {
    params: {
      ...(params?.category ? { category: params.category } : {}),
    },
  })
  return data
}

export async function getEducationVideo(id: number) {
  const { data } = await apiClient.get<{ education_video: EducationVideo }>(
    `/api/education/videos/${id}`
  )
  return data
}

export async function getAdminEducationVideos(
  params?: EducationVideoListParams
) {
  const { data } = await apiClient.get<{ education_videos: EducationVideo[] }>(
    "/admin/education/videos",
    {
      params: {
        ...(params?.category ? { category: params.category } : {}),
      },
    }
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
  onProgress?: (percent: number) => void
) {
  const uploaded = await uploadEducationVideoFileDirectly(
    payload.file,
    onProgress
  )

  const { data } = await apiClient.post<{
    message: string
    education_video: EducationVideo
  }>("/admin/education/videos", {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    upload: uploaded,
  })
  onProgress?.(100)
  return data
}

export async function updateEducationVideo(
  id: number,
  payload: UpdateEducationVideoPayload
) {
  const { data } = await apiClient.put<{
    message: string
    education_video: EducationVideo
  }>(`/admin/education/videos/${id}`, payload)
  return data
}

export async function deleteEducationVideoEntry(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/admin/education/videos/${id}`
  )
  return data
}
