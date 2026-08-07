"use client"

import Link from "next/link"
import * as React from "react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"
import { EducationListView } from "@/sections/education/view/education-list-view"
import { EducationVideosAdminView } from "@/sections/education/view/education-videos-admin-view"

type AdminEducationTab = "articles" | "videos"

export default function AdminEducationPage() {
  const { t } = useLanguage()
  const [tab, setTab] = React.useState<AdminEducationTab>("articles")

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={
            tab === "articles"
              ? t("education.admin.manageTitle")
              : t("education.admin.manageVideosTitle")
          }
          description={
            tab === "articles"
              ? t("education.admin.manageDescription")
              : t("education.admin.manageVideosDescription")
          }
        />
        {tab === "articles" ? (
          <Button render={<Link href="/admin/education/new" />}>
            {t("education.admin.newArticleTitle")}
          </Button>
        ) : null}
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
        <EducationListView adminMode />
      ) : (
        <EducationVideosAdminView />
      )}
    </div>
  )
}
