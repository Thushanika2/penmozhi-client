import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000",
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

export default apiClient

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; errors?: string[]; message?: string }
      | undefined
    if (data?.errors?.length) return data.errors.join(" ")
    if (data?.error) return data.error
    if (data?.message) return data.message
    return error.message
  }
  if (error instanceof Error) return error.message
  return "An unexpected error occurred."
}
