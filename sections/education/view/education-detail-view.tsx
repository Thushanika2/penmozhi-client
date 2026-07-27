"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { localeToEducationLanguage } from "@/i18n/config"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getEducationResource } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

export function EducationDetailView({ id }: { id: number }) {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [resource, setResource] = React.useState<EducationalResource | null>(null)
  const [loading, setLoading] = React.useState(true)
  const expectedLanguage = localeToEducationLanguage(locale)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getEducationResource(id)
        if (cancelled) return

        const article = data.education_resource
        if (article.language !== expectedLanguage) {
          router.replace("/education")
          return
        }

        setResource(article)
      } catch (error) {
        if (!cancelled) {
          toast.error(getLocalizedApiError(error, t))
          setResource(null)
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
  }, [expectedLanguage, id, router, t])

  if (loading)
    return (
      <p className="text-muted-foreground">{t("education.detail.loadingArticle")}</p>
    )
  if (!resource)
    return <p className="text-destructive">{t("education.detail.articleNotFound")}</p>

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-[#f98fcd]/10">
        <div className="flex items-center gap-2">
          <Badge>{resource.content_category}</Badge>
          <span className="text-sm text-muted-foreground">
            {resource.publication_date}
          </span>
        </div>
        <CardTitle className="text-3xl">{resource.article_title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
          {resource.content_body}
        </div>
      </CardContent>
    </Card>
  )
}
