"use client"

import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AdminDashboardView() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Manage educational content and moderate the community forum"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Publish and edit health articles</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button render={<Link href="/admin/education" />}>Manage articles</Button>
            <Button variant="outline" render={<Link href="/admin/education/new" />}>
              New article
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Forum</CardTitle>
            <CardDescription>Review and remove inappropriate posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin/forum/moderation" />}>
              Open moderation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
