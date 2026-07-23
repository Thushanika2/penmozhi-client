import apiClient from "@/lib/api-client"
import type { HealthProfile } from "@/types/health-profile"
import type { UserProfile } from "@/types/user-profile"

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  language_preference: "tamil" | "english"
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthTokenResponse {
  message: string
  access_token: string
  refresh_token: string
  user: UserProfile
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<{
    message: string
    user: UserProfile
    health_profile: HealthProfile
  }>("/api/auth/register", payload)
  return data
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthTokenResponse>("/api/auth/login", payload)
  return data
}

export async function refreshToken(refresh_token: string) {
  const { data } = await apiClient.post<AuthTokenResponse>("/api/auth/refresh", {
    refresh_token,
  })
  return data
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<{
    message: string
    message_code?: string
    reset_token?: string
  }>("/api/auth/forgot-password", { email })
  return data
}

export async function resetPassword(token: string, password: string) {
  const { data } = await apiClient.post<{ message: string }>("/api/auth/reset-password", {
    token,
    password,
  })
  return data
}

export async function logout() {
  const { data } = await apiClient.post<{ message: string }>("/api/auth/logout")
  return data
}

export async function getProfile() {
  const { data } = await apiClient.get<{
    user: UserProfile
    health_profile?: HealthProfile
  }>("/api/auth/profile")
  return data
}

export interface UpdateProfilePayload {
  full_name?: string
  country?: string | null
  timezone?: string
  date_of_birth?: string
  language_preference?: "tamil" | "english"
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<{
    message: string
    user: UserProfile
  }>("/api/auth/profile", payload)
  return data
}

export async function updateLanguagePreference(language_preference: "tamil" | "english") {
  return updateProfile({ language_preference })
}

export async function deleteAccount(password: string) {
  const { data } = await apiClient.delete<{ message: string }>("/api/auth/account", {
    data: { password },
  })
  return data
}
