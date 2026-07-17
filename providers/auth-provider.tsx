"use client"

import * as React from "react"

import * as loginService from "@/services/auth"
import type { HealthProfile } from "@/types/health-profile"
import type { UserProfile } from "@/types/user-profile"

const TOKEN_KEY = "access_token"
const USER_KEY = "user"
const HEALTH_PROFILE_KEY = "health_profile"

interface AuthContextValue {
  user: UserProfile | null
  healthProfile: HealthProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  register: (payload: loginService.RegisterPayload) => Promise<UserProfile>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  setHealthProfile: (profile: HealthProfile | null) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function readStoredHealthProfile(): HealthProfile | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(HEALTH_PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as HealthProfile
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [healthProfile, setHealthProfileState] = React.useState<HealthProfile | null>(
    null,
  )
  const [isLoading, setIsLoading] = React.useState(true)

  const persistSession = React.useCallback(
    (nextUser: UserProfile, token: string, nextHealth?: HealthProfile | null) => {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      if (nextHealth) {
        localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(nextHealth))
        setHealthProfileState(nextHealth)
      }
    },
    [],
  )

  const clearSession = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(HEALTH_PROFILE_KEY)
    setUser(null)
    setHealthProfileState(null)
  }, [])

  const refreshProfile = React.useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      clearSession()
      return
    }
    const data = await loginService.getProfile()
    setUser(data.user)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    if (data.health_profile) {
      setHealthProfileState(data.health_profile)
      localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(data.health_profile))
    }
  }, [clearSession])

  React.useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const storedUser = readStoredUser()
    const storedHealth = readStoredHealthProfile()
    setUser(storedUser)
    setHealthProfileState(storedHealth)

    if (!token) {
      setIsLoading(false)
      return
    }

    refreshProfile()
      .catch(() => clearSession())
      .finally(() => setIsLoading(false))
  }, [clearSession, refreshProfile])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const data = await loginService.login({ email, password })
      persistSession(data.user, data.access_token)
      await refreshProfile()
      return data.user
    },
    [persistSession, refreshProfile],
  )

  const register = React.useCallback(
    async (payload: loginService.RegisterPayload) => {
      const data = await loginService.register(payload)
      const loginData = await loginService.login({
        email: payload.email,
        password: payload.password,
      })
      persistSession(loginData.user, loginData.access_token, data.health_profile)
      return loginData.user
    },
    [persistSession],
  )

  const logout = React.useCallback(async () => {
    try {
      await loginService.logout()
    } catch {
      // Clear local session even if API call fails
    } finally {
      clearSession()
    }
  }, [clearSession])

  const setHealthProfile = React.useCallback((profile: HealthProfile | null) => {
    setHealthProfileState(profile)
    if (profile) {
      localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(profile))
    } else {
      localStorage.removeItem(HEALTH_PROFILE_KEY)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        healthProfile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        setHealthProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
