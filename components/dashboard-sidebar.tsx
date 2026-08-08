"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  Baby,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  Share2,
  Sparkles,
  User,
  Watch,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as React from "react"

import { DashboardBottomNav } from "@/components/dashboard-bottom-nav"
import { ModeSwitcher } from "@/components/mode-switcher"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

interface NavigationItem {
  href: string
  labelKey: string
  icon: LucideIcon
  exact?: boolean
}

const primaryNav: NavigationItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/cycle", labelKey: "nav.cycleTracking", icon: CalendarDays },
  { href: "/dashboard/daily-log", labelKey: "nav.dailyLog", icon: ClipboardList },
  { href: "/dashboard/symptoms", labelKey: "nav.symptoms", icon: Activity },
  { href: "/dashboard/ai-assistant", labelKey: "nav.aiAssistant", icon: Sparkles },
  { href: "/dashboard/insights", labelKey: "nav.insights", icon: LineChart },
  { href: "/dashboard/reminders", labelKey: "nav.reminders", icon: Bell },
  { href: "/dashboard/pcos-status", labelKey: "nav.pcosStatus", icon: HeartPulse },
]

const remainingNav: NavigationItem[] = [
  { href: "/education", labelKey: "nav.education", icon: BookOpen },
  { href: "/dashboard/forum", labelKey: "nav.forum", icon: MessageSquare },
  { href: "/dashboard/sharing", labelKey: "nav.sharing", icon: Share2 },
  { href: "/dashboard/wearables", labelKey: "nav.wearables", icon: Watch },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: User },
]

const modeNavMap: Record<string, NavigationItem[]> = {
  pregnancy: [{ href: "/dashboard/pregnancy", labelKey: "nav.pregnancy", icon: Baby }],
  perimenopause: [{ href: "/dashboard/perimenopause", labelKey: "nav.perimenopause", icon: HeartPulse }],
  conceive: [{ href: "/dashboard/conceive", labelKey: "nav.conceive", icon: Sparkles }],
  period: [],
  non_bleeding: [],
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  async function handleLogout() {
    await logout()
    router.replace("/")
  }

  const modeNav = modeNavMap[user?.mode ?? "period"] ?? []
  const navItems = [...primaryNav, ...modeNav, ...remainingNav]

  return (
    <div className="flex min-h-svh gradient-mesh">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-start justify-between gap-2">
            <BrandLogo href="/dashboard" size="sm" />
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("a11y.closeSidebar")}
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-px overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-link gap-2.5 py-1 pl-4",
                  active ? "nav-link-active" : "nav-link-inactive",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t(item.labelKey)}
              </Link>
            )
          })}

          <ModeSwitcher />
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border bg-muted/50 p-3">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full rounded-full" onClick={handleLogout}>
            <LogOut className="size-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      ) : null}

      <div aria-hidden className="hidden w-64 shrink-0 lg:block" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <Button variant="outline" size="icon" aria-label={t("a11y.openSidebar")} onClick={() => setMobileOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <BrandLogo href="/dashboard" size="sm" className="flex-1" />
          <LanguageSwitcher />
          <ThemeToggle />
        </header>
        <div aria-hidden className="h-14 shrink-0 lg:hidden" />
        <main className="flex-1 p-4 pb-24 md:p-8 lg:pb-10 lg:p-10">{children}</main>
        <DashboardBottomNav />
      </div>
    </div>
  )
}
