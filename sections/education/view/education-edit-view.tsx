"use client"

import * as React from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/api-client"
import { getEducationResource } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

import { EducationFormView } from "../education-new-edit-form"

export function EducationEditView({ id }: { id: number }) {
  const [resource, setResource] = React.useState<EducationalResource | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getEducationResource(id)
        setResource(data.education_resource)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <p className="text-muted-foreground">Loading article...</p>
  if (!resource) return <p className="text-destructive">Article not found.</p>

  return <EducationFormView resource={resource} />
}
