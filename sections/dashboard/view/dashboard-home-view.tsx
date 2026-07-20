"use client"

import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  HeartPulse,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/providers/auth-provider"

const modules = [
  {
    href: "/dashboard/cycle",
    title: "Cycle Tracking",
    description: "Log periods and view predictions",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/symptoms",
    title: "Symptoms",
    description: "Monitor pain, mood, and sleep trends",
    icon: Activity,
  },
  {
    href: "/dashboard/profile",
    title: "Health Profile",
    description: "Update BMI and wellness details",
    icon: User,
  },
  {
    href: "/dashboard/reminders",
    title: "Reminders",
    description: "Medication and supplement schedules",
    icon: Bell,
  },
  {
    href: "/dashboard/ai-assistant",
    title: "AI Assistant",
    description: "Get personalized recommendations",
    icon: Sparkles,
  },
  {
    href: "/dashboard/forum",
    title: "Community Forum",
    description: "Share and learn anonymously",
    icon: MessageSquare,
  },
]

export function DashboardHomeView() {
  const { user, healthProfile } = useAuth()

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${user?.full_name ?? "there"}`}
        description="Your personal health command center — everything you need at a glance."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-5 backdrop-blur-sm">
          <HeartPulse className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-bold">
            {healthProfile?.calculated_bmi?.toFixed(1) ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">Current BMI</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 p-5 backdrop-blur-sm">
          <Badge variant="secondary" className="mb-2">
            {user?.language_preference ?? "english"}
          </Badge>
          <p className="text-sm font-semibold">Language preference</p>
          <p className="text-sm text-muted-foreground">Tamil &amp; English ready</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-[#f98fcd]/10 p-5">
          <Sparkles className="size-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">AI insights enabled</p>
          <p className="text-sm text-muted-foreground">Log symptoms for smart tips</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href} className="group bento-card block">
              <div className="flex items-start justify-between gap-3">
                <div className="bento-icon group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{module.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
