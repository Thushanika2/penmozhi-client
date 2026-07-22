"use client"

import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { EducationFormView } from "@/sections/education/education-new-edit-form"

export default function AdminEducationNewPage() {
  const { t } = useLanguage()

  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/admin/education" />}>
        {t("common.back")}
      </Button>
      <PageHeader
        title={t("education.admin.newArticleTitle")}
        description={t("education.admin.newArticleDescription")}
      />
      <EducationFormView />
    </div>
  )
}
