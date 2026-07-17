"use client"

import Link from "next/link"
import * as React from "react"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/providers/auth-provider"

export function DashboardHomeView() {
  const { user, healthProfile } = useAuth()

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name ?? "there"}`}
        description="Your personal health dashboard — track, understand, and care for yourself."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Tracking</CardTitle>
            <CardDescription>Log periods and view predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/cycle" className="text-sm text-primary underline">
              Go to cycle tracker
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
            <CardDescription>Monitor pain, mood, and sleep trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/symptoms" className="text-sm text-primary underline">
              Log symptoms
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>
              BMI: {healthProfile?.calculated_bmi?.toFixed(1) ?? "Not set"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile" className="text-sm text-primary underline">
              Update profile
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Medication and supplement schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reminders" className="text-sm text-primary underline">
              Manage reminders
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/ai-assistant"
              className="text-sm text-primary underline"
            >
              Open assistant
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Community Forum</CardTitle>
            <CardDescription>Share and learn anonymously</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/forum" className="text-sm text-primary underline">
              Browse forum
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
