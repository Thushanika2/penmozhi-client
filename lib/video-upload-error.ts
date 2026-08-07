export type VideoUploadErrorCode =
  "network" | "provider_rejected" | "timeout" | "too_large"

export class VideoUploadError extends Error {
  readonly code: VideoUploadErrorCode
  readonly detail?: string

  constructor(code: VideoUploadErrorCode, message: string, detail?: string) {
    super(message)
    this.name = "VideoUploadError"
    this.code = code
    this.detail = detail
  }
}

export function isVideoUploadError(error: unknown): error is VideoUploadError {
  return error instanceof VideoUploadError
}
