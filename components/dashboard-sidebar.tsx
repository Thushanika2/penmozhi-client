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

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cycle", label: "Cycle Tracking", icon: CalendarDays },
  { href: "/dashboard/symptoms", label: "Symptoms", icon: Activity },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/dashboard/pcos-status", label: "PCOS Status", icon: HeartPulse },
  { href: "/dashboard/forum", label: "Forum", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-svh bg-muted/30">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-5">
          <div>
            <p className="text-lg font-bold text-primary">Penmozhi</p>
            <p className="text-xs text-muted-foreground">Women&apos;s Health</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/education"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <BookOpen className="size-4" />
            Education
          </Link>
        </nav>
        <div className="border-t p-4">
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-background px-4 py-3 lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <span className="flex-1 font-semibold">Penmozhi</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
