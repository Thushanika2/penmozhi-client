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
  (process.env.NODE_ENV === "development" ? "/backend" : "/backend")

const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const storedRefreshToken = localStorage.getItem("refresh_token")
  if (!storedRefreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{
        access_token: string
        refresh_token: string
      }>(`${baseURL}/api/auth/refresh`, { refresh_token: storedRefreshToken })
      .then(({ data }) => {
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("refresh_token", data.refresh_token)
        return data.access_token
      })
      .catch(() => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

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
  async (error) => {
    if (axios.isAxiosError(error)) {
      const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/auth/refresh") &&
        !originalRequest.url?.includes("/api/auth/login")
      ) {
        originalRequest._retry = true
        const accessToken = await refreshAccessToken()
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      }

      if (!error.response) {
        error.message =
          "Cannot reach the Penmozhi API. Make sure the backend is running on port 5000."
      }
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
