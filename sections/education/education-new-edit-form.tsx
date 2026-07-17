"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api-client"
import {
  createEducationResource,
  updateEducationResource,
} from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

const schema = z.object({
  articleTitle: z.string().min(3, "Title is required"),
  contentCategory: z.string().min(2, "Category is required"),
  contentBody: z.string().min(10, "Content is required"),
  publicationDate: z.string().min(1, "Publication date is required"),
})

type FormValues = z.infer<typeof schema>

export function EducationFormView({
  resource,
}: {
  resource?: EducationalResource
}) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: resource
      ? {
          articleTitle: resource.article_title,
          contentCategory: resource.content_category,
          contentBody: resource.content_body,
          publicationDate: resource.publication_date,
        }
      : {
          publicationDate: new Date().toISOString().slice(0, 10),
        },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      article_title: values.articleTitle,
      content_category: values.contentCategory,
      content_body: values.contentBody,
      publication_date: values.publicationDate,
    }

    try {
      if (resource) {
        await updateEducationResource(resource.id, payload)
        toast.success("Article updated")
      } else {
        await createEducationResource(payload)
        toast.success("Article published")
      }
      router.push("/admin/education")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource ? "Edit article" : "New article"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleTitle">Title</Label>
            <Input id="articleTitle" {...register("articleTitle")} />
            {errors.articleTitle ? (
              <p className="text-sm text-destructive">{errors.articleTitle.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentCategory">Category</Label>
            <Input id="contentCategory" {...register("contentCategory")} />
            {errors.contentCategory ? (
              <p className="text-sm text-destructive">
                {errors.contentCategory.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicationDate">Publication date</Label>
            <Input
              id="publicationDate"
              type="date"
              {...register("publicationDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentBody">Content</Label>
            <Textarea
              id="contentBody"
              rows={12}
              {...register("contentBody")}
            />
            {errors.contentBody ? (
              <p className="text-sm text-destructive">{errors.contentBody.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : resource ? "Update" : "Publish"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/education")}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
