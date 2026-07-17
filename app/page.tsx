import Link from "next/link"
import { ArrowRight, BookOpen, HeartPulse, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-primary/5 via-background to-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div>
          <p className="text-2xl font-extrabold text-primary">Penmozhi</p>
          <p className="text-sm text-muted-foreground">பெண்மொழி · Women&apos;s Health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/auth/login" />}>
            Login
          </Button>
          <Button render={<Link href="/auth/register" />}>Get Started</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Your calm space for cycle, symptom, and wellness tracking
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Penmozhi helps you understand your body with cycle predictions, symptom
              trends, medication reminders, and AI-guided insights — in Tamil or English.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/auth/register" />}>
                Create free account
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/education" />}
              >
                Browse education
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CalendarIcon />
                <CardTitle>Cycle Tracking</CardTitle>
                <CardDescription>
                  Log periods and see next-period predictions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <HeartPulse className="size-5 text-primary" />
                <CardTitle>Symptom Trends</CardTitle>
                <CardDescription>
                  Track pain, mood, and sleep over time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="size-5 text-primary" />
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Get personalized wellness recommendations.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="size-5 text-primary" />
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Trusted articles on women&apos;s health topics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Private, supportive, bilingual</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Forum posts appear anonymously. Your health data stays linked to your account
            and is available every time you sign in.
          </p>
        </section>
      </main>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-5 text-primary"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
