import type { UserProfile } from "@/types/user-profile"

export function getPostAuthPath(user: UserProfile): string {
  if (user.role === "admin") return "/admin/dashboard"
  if (!user.onboarding_completed) return "/onboarding"
  return "/dashboard"
}
