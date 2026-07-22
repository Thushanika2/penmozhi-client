"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const { t } = useLanguage()
  const [resources, setResources] = React.useState<EducationalResource[]>([])
  const [category, setCategory] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getEducationResources(category || undefined)
        setResources(data.education_resources)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category, t])

  if (loading) {
    return <p className="text-muted-foreground">{t("education.loadingArticles")}</p>
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
        {resources.map((resource) => (
          <article
            key={resource.id}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-[#f98fcd]/10 px-6 py-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold leading-snug">{resource.article_title}</h3>
                <Badge variant="secondary">{resource.content_category}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("education.published", { date: resource.publication_date })}
              </p>
            </div>
            <div className="p-6">
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {resource.content_body}
              </p>
              <Link
                href={
                  adminMode
                    ? `/admin/education/edit/${resource.id}`
                    : `/education/${resource.id}`
                }
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {adminMode ? t("education.editArticle") : t("education.readMore")}
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!resources.length ? (
        <p className="text-muted-foreground">{t("education.noArticles")}</p>
      ) : null}
      {publicMode ? null : null}
    </div>
  )
}
