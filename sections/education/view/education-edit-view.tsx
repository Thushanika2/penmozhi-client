"use client"

import * as React from "react"
import { toast } from "sonner"

import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getEducationResource } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

import { EducationFormView } from "../education-new-edit-form"

export function EducationEditView({ id }: { id: number }) {
  const { t } = useLanguage()
  const [resource, setResource] = React.useState<EducationalResource | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getEducationResource(id)
        setResource(data.education_resource)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, t])

  if (loading)
    return (
      <p className="text-muted-foreground">{t("education.detail.loadingArticle")}</p>
    )
  if (!resource)
    return <p className="text-destructive">{t("education.detail.articleNotFound")}</p>

  return <EducationFormView resource={resource} />
}
