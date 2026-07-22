"use client"

import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { EducationListView } from "@/sections/education/view/education-list-view"

export default function AdminEducationPage() {
  const { t } = useLanguage()

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader
          title={t("education.admin.manageTitle")}
          description={t("education.admin.manageDescription")}
        />
        <Button render={<Link href="/admin/education/new" />}>
          {t("education.admin.newArticleTitle")}
        </Button>
      </div>
      <EducationListView adminMode />
    </div>
  )
}
