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

function renderArticleBody(body: string) {
  return body.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium text-primary underline underline-offset-2"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={`text-${index}`}>{part}</React.Fragment>
    ),
  )
}

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
      <p className="text-text-secondary">{t("education.detail.loadingArticle")}</p>
    )
  if (!resource)
    return <p className="text-destructive">{t("education.detail.articleNotFound")}</p>

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-border/50 bg-muted/50">
        <div className="flex items-center gap-2">
          <Badge>{resource.content_category}</Badge>
          <span className="text-sm text-text-secondary">
            {resource.publication_date}
          </span>
        </div>
        <CardTitle className="text-3xl text-text-primary">{resource.article_title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {resource.video_url ? (
          <video
            src={resource.video_url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full rounded-xl bg-black"
          >
            {t("education.detail.videoUnsupported")}
          </video>
        ) : null}
        <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
          {renderArticleBody(resource.content_body)}
        </div>
      </CardContent>
    </Card>
  )
}
