"use client"

import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getApiErrorMessage } from "@/lib/api-client"
import { getEducationResource } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

export function EducationDetailView({ id }: { id: number }) {
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
