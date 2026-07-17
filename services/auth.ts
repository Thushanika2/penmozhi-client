import apiClient from "@/lib/api-client"
import type { HealthProfile } from "@/types/health-profile"
import type { UserProfile } from "@/types/user-profile"

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  date_of_birth: string
  language_preference: "tamil" | "english"
}

export interface LoginPayload {
  email: string
  password: string
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
  const { data } = await apiClient.post<{
    message: string
    access_token: string
    user: UserProfile
  }>("/api/auth/login", payload)
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
