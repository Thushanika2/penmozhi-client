import axios from "axios"

import { getApiErrorMessage, getApiErrorPayload } from "@/lib/api-client"
import { isVideoUploadError } from "@/lib/video-upload-error"

type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string

export function getLocalizedApiError(error: unknown, t: Translate): string {
  const fromKey = (code: string) => {
    const key = `api.errors.${code}`
    const translated = t(key)
    return translated === key ? null : translated
  }

  const payload = getApiErrorPayload(error)
  if (payload?.errors?.length) {
    const first = payload.errors[0]
    if (typeof first === "object" && first?.code) {
      return fromKey(first.code) ?? first.message ?? first.code
    }
  }

  if (payload?.error_code) {
    return fromKey(payload.error_code) ?? payload.error ?? payload.error_code
  }

  if (payload?.error) return payload.error
  if (payload?.message) return payload.message

  const fallback = getApiErrorMessage(error)
  if (fallback.includes("request timed out")) {
    return t("api.errors.timeout")
  }
  if (fallback.includes("Cannot reach the Penmozhi API")) {
    return t("api.errors.network")
  }

  return fallback || t("api.errors.unexpected")
}

export function getLocalizedVideoUploadError(
  error: unknown,
  t: Translate
): string {
  if (isVideoUploadError(error)) {
    if (error.code === "too_large") return t("education.form.videoTooLarge")
    if (error.code === "timeout") return t("education.form.videoUploadTimeout")
    if (error.code === "network") return t("education.form.videoUploadNetwork")
    if (error.detail) {
      return t("education.form.videoUploadRejected", { reason: error.detail })
    }
    return t("education.form.videoUploadProviderError")
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 413) return t("education.form.videoTooLarge")
    if (
      error.code === "ECONNABORTED" ||
      error.message.toLowerCase().includes("timeout")
    ) {
      return t("education.form.videoUploadTimeout")
    }
  }

  return getLocalizedApiError(error, t)
}
