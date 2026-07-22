"use client"

import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { EducationEditView } from "@/sections/education/view/education-edit-view"

export default function AdminEducationEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { t } = useLanguage()

  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/admin/education" />}>
        {t("common.back")}
      </Button>
      <EducationEditView id={Number(id)} />
    </div>
  )
}
