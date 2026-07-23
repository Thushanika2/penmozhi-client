"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ClipboardList, LayoutDashboard, LineChart, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/cycle", labelKey: "nav.cycleTracking", icon: CalendarDays },
  { href: "/dashboard/daily-log", labelKey: "nav.dailyLog", icon: ClipboardList },
  { href: "/dashboard/insights", labelKey: "nav.insights", icon: LineChart },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: User },
]

export function DashboardBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="bottom-nav" aria-label={t("nav.dashboard")}>
      {navItems.map((item) => {
        const Icon = item.icon
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("bottom-nav-link", active ? "bottom-nav-active" : "bottom-nav-inactive")}
          >
            <Icon className="size-5" />
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
