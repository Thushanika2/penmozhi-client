"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, Upload } from "lucide-react"
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
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { localeToEducationLanguage } from "@/i18n/config"
import {
  getLocalizedApiError,
  getLocalizedVideoUploadError,
} from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import {
  createEducationResource,
  deleteEducationVideo,
  updateEducationResource,
  uploadEducationVideo,
} from "@/services/education"
import type { EducationalResource } from "@/types/educational-resource"

interface FormValues {
  articleTitle: string
  contentCategory: string
  contentBody: string
  publicationDate: string
  language: "english" | "tamil"
}

const MAX_VIDEO_BYTES = 200 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
])

export function EducationFormView({
  resource,
}: {
  resource?: EducationalResource
}) {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [videoUrl, setVideoUrl] = React.useState<string | null>(
    resource?.video_url ?? null
  )
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [removingVideo, setRemovingVideo] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

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
        language: z.enum(["english", "tamil"]),
      }),
    [t]
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
          language: resource.language ?? "english",
        }
      : {
          publicationDate: new Date().toISOString().slice(0, 10),
          language: localeToEducationLanguage(locale),
        },
  })

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(t("education.form.videoTooLarge"))
      event.target.value = ""
      return
    }
    const lower = file.name.toLowerCase()
    const extensionOk =
      lower.endsWith(".mp4") ||
      lower.endsWith(".mov") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".m4v")
    if (
      !extensionOk ||
      (file.type &&
        !ALLOWED_VIDEO_TYPES.has(file.type) &&
        !file.type.startsWith("video/"))
    ) {
      toast.error(t("education.form.videoInvalidType"))
      event.target.value = ""
      return
    }
    setSelectedFile(file)
  }

  async function handleUploadVideo() {
    if (!resource || !selectedFile) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const data = await uploadEducationVideo(
        resource.id,
        selectedFile,
        setUploadProgress
      )
      setVideoUrl(data.education_resource.video_url)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      toast.success(t("education.form.videoUploaded"))
    } catch (error) {
      toast.error(getLocalizedVideoUploadError(error, t))
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveVideo() {
    if (!resource || !videoUrl) return
    setRemovingVideo(true)
    try {
      const data = await deleteEducationVideo(resource.id)
      setVideoUrl(data.education_resource.video_url)
      toast.success(t("education.form.videoRemoved"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setRemovingVideo(false)
    }
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      article_title: values.articleTitle,
      content_category: values.contentCategory,
      content_body: values.contentBody,
      publication_date: values.publicationDate,
      language: values.language,
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
          {resource
            ? t("education.form.editArticle")
            : t("education.form.newArticle")}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="articleTitle">
              {t("education.form.titleLabel")}
            </Label>
            <Input id="articleTitle" {...register("articleTitle")} />
            {errors.articleTitle ? (
              <p className="text-sm text-destructive">
                {errors.articleTitle.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentCategory">
              {t("education.form.categoryLabel")}
            </Label>
            <Input id="contentCategory" {...register("contentCategory")} />
            {errors.contentCategory ? (
              <p className="text-sm text-destructive">
                {errors.contentCategory.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">
              {t("education.form.languageLabel")}
            </Label>
            <Select id="language" {...register("language")}>
              <option value="english">{t("education.languageEnglish")}</option>
              <option value="tamil">{t("education.languageTamil")}</option>
            </Select>
            {errors.language ? (
              <p className="text-sm text-destructive">
                {errors.language.message}
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
            <Label htmlFor="contentBody">
              {t("education.form.contentLabel")}
            </Label>
            <Textarea id="contentBody" rows={12} {...register("contentBody")} />
            {errors.contentBody ? (
              <p className="text-sm text-destructive">
                {errors.contentBody.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div>
              <Label>{t("education.form.videoLabel")}</Label>
              <p className="mt-1 text-xs text-text-secondary">
                {resource
                  ? t("education.form.videoHint")
                  : t("education.form.videoSaveFirst")}
              </p>
            </div>

            {videoUrl ? (
              <div className="space-y-3">
                <video
                  src={videoUrl}
                  controls
                  className="aspect-video w-full rounded-lg bg-black"
                  preload="metadata"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={removingVideo || uploading}
                  onClick={() => void handleRemoveVideo()}
                >
                  <Trash2 className="size-4" />
                  {removingVideo
                    ? t("education.form.videoRemoving")
                    : t("education.form.videoRemove")}
                </Button>
              </div>
            ) : null}

            {resource ? (
              <div className="space-y-3">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.mov,.webm,.m4v"
                  disabled={uploading}
                  onChange={onFileChange}
                />
                {selectedFile ? (
                  <p className="text-xs text-text-secondary">
                    {selectedFile.name} (
                    {Math.round(selectedFile.size / (1024 * 1024))} MB)
                  </p>
                ) : null}
                {uploading ? (
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary">
                      {t("education.form.videoUploading", {
                        percent: String(uploadProgress),
                      })}
                    </p>
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!selectedFile || uploading}
                  onClick={() => void handleUploadVideo()}
                >
                  <Upload className="size-4" />
                  {uploading
                    ? t("education.form.videoUploading", {
                        percent: String(uploadProgress),
                      })
                    : t("education.form.videoUpload")}
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || uploading || removingVideo}
          >
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
