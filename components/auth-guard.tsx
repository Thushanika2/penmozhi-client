"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { getPostAuthPath } from "@/lib/auth-redirect"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import type { UserRole } from "@/types/user-profile"

function getDashboardPath(role: UserRole) {
  return role === "admin" ? "/admin/dashboard" : "/dashboard"
}

export function AuthenticatedRoute({
  children,
  allowedRoles,
  onboardingOnly = false,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  onboardingOnly?: boolean
}) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/auth/login")
      return
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardPath(user.role))
      return
    }
    if (onboardingOnly && user.onboarding_completed) {
      router.replace(getPostAuthPath(user))
      return
    }
    if (!onboardingOnly && !user.onboarding_completed && user.role !== "admin") {
      router.replace("/onboarding")
    }
  }, [allowedRoles, isLoading, onboardingOnly, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    )
  }

  if (!user) return null
  if (allowedRoles && !allowedRoles.includes(user.role)) return null
  if (onboardingOnly && user.onboarding_completed) return null
  if (!onboardingOnly && !user.onboarding_completed && user.role !== "admin") return null

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading || !user) return
    router.replace(getPostAuthPath(user))
  }, [isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    )
  }

  if (user) return null

  return <>{children}</>
}
