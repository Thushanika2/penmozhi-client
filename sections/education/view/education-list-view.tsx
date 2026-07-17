"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/api-client"
import { getEducationResources } from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

export function EducationListView({
  publicMode = false,
  adminMode = false,
}: {
  publicMode?: boolean
  adminMode?: boolean
}) {
  const [resources, setResources] = React.useState<EducationalResource[]>([])
  const [category, setCategory] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getEducationResources(category || undefined)
        setResources(data.education_resources)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category])

  if (loading) {
    return <p className="text-muted-foreground">Loading articles...</p>
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter by category..."
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{resource.article_title}</CardTitle>
                <Badge variant="secondary">{resource.content_category}</Badge>
              </div>
              <CardDescription>
                Published {resource.publication_date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {resource.content_body}
              </p>
              <Link
                href={
                  adminMode
                    ? `/admin/education/edit/${resource.id}`
                    : `/education/${resource.id}`
                }
                className="mt-3 inline-block text-sm font-medium text-primary underline"
              >
                {adminMode ? "Edit article" : "Read more"}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {!resources.length ? (
        <p className="text-muted-foreground">No articles found.</p>
      ) : null}
      {publicMode ? null : null}
    </div>
  )
}
