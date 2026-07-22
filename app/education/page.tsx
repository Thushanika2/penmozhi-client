"use client"

import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { EducationListView } from "@/sections/education/view/education-list-view"

export default function EducationPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-svh flex-col gradient-mesh">
      <SiteHeader showAuth={false}>
        <Button variant="outline" className="rounded-full" render={<Link href="/" />}>
          {t("header.home")}
        </Button>
      </SiteHeader>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10">
          <p className="section-eyebrow">{t("education.eyebrow")}</p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("education.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t("education.description")}
          </p>
        </div>
        <EducationListView publicMode />
      </div>

      <SiteFooter />
    </div>
  )
}
