import axios from "axios"
export interface ApiValidationError {
  code?: string
  message?: string
}

export interface ApiErrorPayload {
  error?: string
  error_code?: string
  errors?: Array<string | ApiValidationError>
  message?: string
  message_code?: string
  ai_flag?: string | null
  ai_flag_code?: string | null
}


const baseURL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "/backend" : "http://127.0.0.1:5000")

const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && !error.response) {
      error.message =
        "Cannot reach the Penmozhi API. Make sure the backend is running on port 5000."
    }
    return Promise.reject(error)
  },
)

export default apiClient

export function getApiErrorPayload(error: unknown): ApiErrorPayload | undefined {
  if (!axios.isAxiosError(error)) return undefined
  return error.response?.data as ApiErrorPayload | undefined
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = getApiErrorPayload(error)
    if (data?.errors?.length) {
      return data.errors
        .map((entry) => (typeof entry === "string" ? entry : entry.message ?? entry.code ?? ""))
        .join(" ")
    }
    if (data?.error) return data.error
    if (data?.message) return data.message
    return error.message
  }
  if (error instanceof Error) return error.message
  return "unexpected_error"
}

export function getApiBaseUrl(): string {
  return baseURL
}
