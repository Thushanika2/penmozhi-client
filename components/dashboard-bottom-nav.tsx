"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ClipboardList, Heart, LayoutDashboard, LineChart, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

const baseNavItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true as const },
  { href: "/dashboard/cycle", labelKey: "nav.cycleTracking", icon: CalendarDays, exact: false as const },
  { href: "/dashboard/daily-log", labelKey: "nav.dailyLog", icon: ClipboardList, exact: false as const },
  { href: "/dashboard/insights", labelKey: "nav.insights", icon: LineChart, exact: false as const },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: User, exact: false as const },
]

const modeNavItems: Record<
  string,
  { href: string; labelKey: string; icon: typeof Heart; exact: false }
> = {
  pregnancy: { href: "/dashboard/pregnancy", labelKey: "nav.pregnancy", icon: Heart, exact: false },
  perimenopause: { href: "/dashboard/perimenopause", labelKey: "nav.perimenopause", icon: Heart, exact: false },
  conceive: { href: "/dashboard/conceive", labelKey: "nav.conceive", icon: Heart, exact: false },
}

export function DashboardBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user } = useAuth()

  const modeItem = modeNavItems[user?.mode ?? ""]
  const navItems = modeItem
    ? [...baseNavItems.slice(0, 4), modeItem, baseNavItems[4]]
    : baseNavItems

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
