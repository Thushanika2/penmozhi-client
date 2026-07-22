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
import { useLanguage } from "@/providers/language-provider"

export function AdminDashboardView() {
  const { t } = useLanguage()

  return (
    <div>
      <PageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.educationTitle")}</CardTitle>
            <CardDescription>{t("admin.dashboard.educationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button render={<Link href="/admin/education" />}>
              {t("admin.dashboard.manageArticles")}
            </Button>
            <Button variant="outline" render={<Link href="/admin/education/new" />}>
              {t("admin.dashboard.newArticle")}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.forumTitle")}</CardTitle>
            <CardDescription>{t("admin.dashboard.forumDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin/forum/moderation" />}>
              {t("admin.dashboard.openModeration")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
