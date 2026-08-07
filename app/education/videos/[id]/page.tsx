"use client"

import Link from "next/link"
import * as React from "react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { EducationVideoDetailView } from "@/sections/education/view/education-video-detail-view"

export default function EducationVideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { t } = useLanguage()

  return (
    <div className="flex min-h-svh flex-col gradient-mesh">
      <SiteHeader maxWidth="4xl" showAuth={false}>
        <Button
          variant="outline"
          className="rounded-full"
          render={<Link href="/education?tab=videos" />}
        >
          {t("education.videos.allVideos")}
        </Button>
      </SiteHeader>

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 rounded-full text-muted-foreground"
          render={<Link href="/education?tab=videos" />}
        >
          {t("education.videos.backToVideos")}
        </Button>
        <EducationVideoDetailView id={Number(id)} />
      </div>

      <SiteFooter />
    </div>
  )
}
