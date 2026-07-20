import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartPulse,
  Languages,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: CalendarDays,
    title: "Cycle Tracking",
    description: "Log periods and see AI-powered next-period predictions.",
  },
  {
    icon: HeartPulse,
    title: "Symptom Trends",
    description: "Track pain, mood, and sleep with beautiful trend charts.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Get personalized wellness recommendations instantly.",
  },
  {
    icon: BookOpen,
    title: "Education Hub",
    description: "Trusted articles on women's health and wellness.",
  },
]

const stats = [
  { label: "Bilingual support", value: "Tamil + English", icon: Languages },
  { label: "Private forum", value: "Anonymous posts", icon: Users },
  { label: "Secure data", value: "Owner-only access", icon: Shield },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden gradient-mesh">
      <div className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-[#f98fcd]/20 blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-border/50 glass-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/education" />}>
              Education
            </Button>
            <Button variant="outline" render={<Link href="/auth/login" />}>
              Login
            </Button>
            <Button render={<Link href="/auth/register" />}>Get Started</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge className="rounded-full px-3 py-1" variant="secondary">
              Trusted women's health companion
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Understand your body with{" "}
              <span className="bg-gradient-to-r from-primary via-[#f54baf] to-[#f98fcd] bg-clip-text text-transparent">
                calm, confident care
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Penmozhi helps you track cycles, log symptoms, set reminders, and get
              AI-guided insights — beautifully designed for Tamil and English speakers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-6" render={<Link href="/auth/register" />}>
                Create free account
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6"
                render={<Link href="/education" />}
              >
                Explore education
              </Button>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-2 size-4 text-primary" />
                    <p className="text-sm font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-[#f76dbe]/15 to-transparent blur-2xl" />
            <div className="relative rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
              <BrandLogo href="/" size="xl" showTagline />
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                A modern health dashboard built for privacy, empathy, and everyday
                wellness — from cycle predictions to community support.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">Cycle AI</Badge>
                <Badge variant="outline">PCOS tracking</Badge>
                <Badge variant="outline">Reminders</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Features
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need in one place
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Trending dashboard layout with quick access to every module in your
              health journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="group bento-card">
                  <div className="bento-icon group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-[#f76dbe]/10 to-[#f98fcd]/10 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Private, supportive, bilingual</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Forum posts appear anonymously. Your health data stays linked to your account
            and is available every time you sign in.
          </p>
          <Button size="lg" className="mt-6 rounded-full px-8" render={<Link href="/auth/register" />}>
            Start your wellness journey
          </Button>
        </section>
      </main>
    </div>
  )
}
