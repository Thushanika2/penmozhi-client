"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as React from "react"
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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import {
  createEducationResource,
  updateEducationResource,
} from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

interface FormValues {
  articleTitle: string
  contentCategory: string
  contentBody: string
  publicationDate: string
}

export function EducationFormView({
  resource,
}: {
  resource?: EducationalResource
}) {
  const { t } = useLanguage()
  const router = useRouter()

  const schema = React.useMemo(
    () =>
      z.object({
        articleTitle: z
          .string()
          .min(3, t("education.form.validation.titleRequired")),
        contentCategory: z
          .string()
          .min(2, t("education.form.validation.categoryRequired")),
        contentBody: z
          .string()
          .min(10, t("education.form.validation.contentRequired")),
        publicationDate: z
          .string()
          .min(1, t("education.form.validation.publicationDateRequired")),
      }),
    [t],
  )

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
        toast.success(t("education.form.articleUpdated"))
      } else {
        await createEducationResource(payload)
        toast.success(t("education.form.articlePublished"))
      }
      router.push("/admin/education")
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {resource ? t("education.form.editArticle") : t("education.form.newArticle")}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleTitle">{t("education.form.titleLabel")}</Label>
            <Input id="articleTitle" {...register("articleTitle")} />
            {errors.articleTitle ? (
              <p className="text-sm text-destructive">{errors.articleTitle.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentCategory">{t("education.form.categoryLabel")}</Label>
            <Input id="contentCategory" {...register("contentCategory")} />
            {errors.contentCategory ? (
              <p className="text-sm text-destructive">
                {errors.contentCategory.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicationDate">
              {t("education.form.publicationDateLabel")}
            </Label>
            <Input
              id="publicationDate"
              type="date"
              {...register("publicationDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentBody">{t("education.form.contentLabel")}</Label>
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
            {isSubmitting
              ? t("common.saving")
              : resource
                ? t("education.form.update")
                : t("education.form.publish")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/education")}
          >
            {t("common.cancel")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
