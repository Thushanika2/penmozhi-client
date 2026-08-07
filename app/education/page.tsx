"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Suspense } from "react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"
import { EducationListView } from "@/sections/education/view/education-list-view"
import { EducationVideosListView } from "@/sections/education/view/education-videos-list-view"

type EducationTab = "articles" | "videos"

function EducationPageContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab: EducationTab = tabParam === "videos" ? "videos" : "articles"

  return <EducationTabs key={initialTab} initialTab={initialTab} t={t} />
}

function EducationTabs({
  initialTab,
  t,
}: {
  initialTab: EducationTab
  t: ReturnType<typeof useLanguage>["t"]
}) {
  const [tab, setTab] = React.useState<EducationTab>(initialTab)

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

        <div
          className="mb-8 inline-flex rounded-full border border-border/70 bg-card/80 p-1 shadow-sm"
          role="tablist"
          aria-label={t("education.tabsLabel")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "articles"}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              tab === "articles"
                ? "bg-primary text-primary-foreground"
                : "text-text-secondary hover:text-text-primary",
            )}
            onClick={() => setTab("articles")}
          >
            {t("education.tabArticles")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "videos"}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              tab === "videos"
                ? "bg-primary text-primary-foreground"
                : "text-text-secondary hover:text-text-primary",
            )}
            onClick={() => setTab("videos")}
          >
            {t("education.tabVideos")}
          </button>
        </div>

        {tab === "articles" ? (
          <EducationListView publicMode />
        ) : (
          <EducationVideosListView />
        )}
      </div>

      <SiteFooter />
    </div>
  )
}

export default function EducationPage() {
  return (
    <Suspense fallback={null}>
      <EducationPageContent />
    </Suspense>
  )
}
