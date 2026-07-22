"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  User,
  X,
} from "lucide-react"
import * as React from "react"

import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cycle", labelKey: "nav.cycleTracking", icon: CalendarDays },
  { href: "/dashboard/symptoms", labelKey: "nav.symptoms", icon: Activity },
  { href: "/dashboard/reminders", labelKey: "nav.reminders", icon: Bell },
  { href: "/dashboard/ai-assistant", labelKey: "nav.aiAssistant", icon: Sparkles },
  { href: "/dashboard/pcos-status", labelKey: "nav.pcosStatus", icon: HeartPulse },
  { href: "/dashboard/forum", labelKey: "nav.forum", icon: MessageSquare },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: User },
]

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-svh gradient-mesh">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border/50 bg-sidebar/95 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-border/50 px-5 py-5">
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

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-link pl-4",
                  active ? "nav-link-active" : "nav-link-inactive",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t(item.labelKey)}
              </Link>
            )
          })}
          <div className="my-3 border-t border-border/50" />
          <Link
            href="/education"
            className="nav-link nav-link-inactive pl-4"
          >
            <BookOpen className="size-4 shrink-0" />
            {t("nav.education")}
          </Link>
        </nav>

        <div className="border-t border-border/50 p-4">
          <div className="rounded-2xl border border-border/50 bg-muted/50 p-3.5">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-full"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label={t("a11y.openSidebar")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <BrandLogo href="/dashboard" size="sm" className="flex-1" />
          <LanguageSwitcher />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
