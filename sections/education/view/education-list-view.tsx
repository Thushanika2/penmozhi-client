"use client"

import Link from "next/link"
import { Play } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { localeToEducationLanguage } from "@/i18n/config"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getEducationResources } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

export function EducationListView({
  publicMode = false,
  adminMode = false,
}: {
  publicMode?: boolean
  adminMode?: boolean
}) {
  const { t, locale } = useLanguage()
  const [resources, setResources] = React.useState<EducationalResource[]>([])
  const [category, setCategory] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getEducationResources({
          category: category || undefined,
          language: adminMode ? undefined : localeToEducationLanguage(locale),
        })
        if (!cancelled) {
          setResources(data.education_resources)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getLocalizedApiError(error, t))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [adminMode, category, locale, t])

  if (loading) {
    return <p className="text-text-secondary">{t("education.loadingArticles")}</p>
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={t("education.filterPlaceholder")}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="max-w-sm rounded-full"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource) => {
          const href = adminMode
            ? `/admin/education/edit/${resource.id}`
            : `/education/${resource.id}`
          const hasVideo = Boolean(resource.video_url)

          return (
            <article
              key={resource.id}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
            >
              {hasVideo ? (
                <Link
                  href={href}
                  className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#2a1824] to-[#120810]"
                  aria-label={t("education.hasVideo")}
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                    <Play className="size-6 fill-current" />
                  </span>
                </Link>
              ) : null}
              <div className="border-b border-border/50 bg-muted/50 px-6 py-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-snug text-text-primary">
                    {resource.article_title}
                  </h3>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="secondary">{resource.content_category}</Badge>
                    {hasVideo ? (
                      <Badge variant="outline">{t("education.hasVideo")}</Badge>
                    ) : null}
                    {adminMode ? (
                      <Badge variant="outline">
                        {resource.language === "tamil"
                          ? t("education.languageTamil")
                          : t("education.languageEnglish")}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {t("education.published", { date: resource.publication_date })}
                </p>
              </div>
              <div className="p-6">
                <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                  {resource.content_body}
                </p>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {adminMode ? t("education.editArticle") : t("education.readMore")}
                </Link>
              </div>
            </article>
          )
        })}
      </div>
      {!resources.length ? (
        <p className="text-text-secondary">{t("education.noArticles")}</p>
      ) : null}
      {publicMode ? null : null}
    </div>
  )
}
