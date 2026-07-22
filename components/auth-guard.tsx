"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import type { UserRole } from "@/types/user-profile"

function getDashboardPath(role: UserRole) {
  return role === "admin" ? "/admin/dashboard" : "/dashboard"
}

export function AuthenticatedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
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
    }
  }, [allowedRoles, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    )
  }

  if (!user) return null
  if (allowedRoles && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading || !user) return
    router.replace(getDashboardPath(user.role))
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
