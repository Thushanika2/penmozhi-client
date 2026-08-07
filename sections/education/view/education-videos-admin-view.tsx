"use client"

import { Pencil, Play, Trash2, Upload, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import {
  createEducationVideo,
  deleteEducationVideoEntry,
  getAdminEducationVideos,
  updateEducationVideo,
} from "@/services/education-videos"
import {
  EDUCATION_CATEGORIES,
  type EducationVideo,
} from "@/types/education-video"

const MAX_VIDEO_BYTES = 200 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
])

export function EducationVideosAdminView() {
  const { t } = useLanguage()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [videos, setVideos] = React.useState<EducationVideo[]>([])
  const [categoryFilter, setCategoryFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [showUpload, setShowUpload] = React.useState(false)
  const [editing, setEditing] = React.useState<EducationVideo | null>(null)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<string>(EDUCATION_CATEGORIES[0])
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [savingEdit, setSavingEdit] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)

  const loadVideos = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminEducationVideos({
        category: categoryFilter || undefined,
      })
      setVideos(data.education_videos)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, t])

  React.useEffect(() => {
    void loadVideos()
  }, [loadVideos])

  function resetUploadForm() {
    setTitle("")
    setDescription("")
    setCategory(EDUCATION_CATEGORIES[0])
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

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
      (file.type && !ALLOWED_VIDEO_TYPES.has(file.type) && !file.type.startsWith("video/"))
    ) {
      toast.error(t("education.form.videoInvalidType"))
      event.target.value = ""
      return
    }
    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!title.trim() || !category.trim() || !selectedFile) {
      toast.error(t("education.videos.uploadValidation"))
      return
    }
    setUploading(true)
    setUploadProgress(0)
    try {
      await createEducationVideo(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim(),
          file: selectedFile,
        },
        setUploadProgress,
      )
      toast.success(t("education.videos.uploaded"))
      resetUploadForm()
      setShowUpload(false)
      await loadVideos()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setUploading(false)
    }
  }

  function openEdit(video: EducationVideo) {
    setEditing(video)
    setTitle(video.title)
    setDescription(video.description ?? "")
    setCategory(video.category)
    setShowUpload(false)
  }

  async function handleSaveEdit() {
    if (!editing) return
    if (!title.trim() || !category.trim()) {
      toast.error(t("education.videos.uploadValidation"))
      return
    }
    setSavingEdit(true)
    try {
      await updateEducationVideo(editing.id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim(),
      })
      toast.success(t("education.videos.updated"))
      setEditing(null)
      resetUploadForm()
      await loadVideos()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(t("education.videos.deleteConfirm"))) return
    setDeletingId(id)
    try {
      await deleteEducationVideoEntry(id)
      toast.success(t("education.videos.deleted"))
      await loadVideos()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder={t("education.filterPlaceholder")}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="max-w-sm rounded-full"
        />
        <Button
          type="button"
          onClick={() => {
            setEditing(null)
            resetUploadForm()
            setShowUpload((open) => !open)
          }}
        >
          <Upload className="size-4" />
          {showUpload
            ? t("education.videos.cancelUpload")
            : t("education.videos.uploadButton")}
        </Button>
      </div>

      {showUpload || editing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editing
                ? t("education.videos.editTitle")
                : t("education.videos.uploadTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">{t("education.form.titleLabel")}</Label>
              <Input
                id="video-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-description">
                {t("education.videos.descriptionLabel")}
              </Label>
              <Textarea
                id="video-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-category">{t("education.form.categoryLabel")}</Label>
              <Select
                id="video-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Array.from(
                  new Set([
                    ...EDUCATION_CATEGORIES,
                    ...(category ? [category] : []),
                  ]),
                ).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            {!editing ? (
              <div className="space-y-2">
                <Label htmlFor="video-file">{t("education.videos.fileLabel")}</Label>
                <p className="text-xs text-text-secondary">
                  {t("education.form.videoHint")}
                </p>
                <Input
                  id="video-file"
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.mov,.webm,.m4v"
                  onChange={onFileChange}
                />
                {selectedFile ? (
                  <p className="text-xs text-text-secondary">{selectedFile.name}</p>
                ) : null}
                {uploading ? (
                  <p className="text-sm text-text-secondary">
                    {t("education.form.videoUploading", {
                      percent: String(uploadProgress),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="gap-2">
            {editing ? (
              <>
                <Button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => void handleSaveEdit()}
                >
                  {savingEdit
                    ? t("education.videos.saving")
                    : t("education.form.update")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null)
                    resetUploadForm()
                  }}
                >
                  <X className="size-4" />
                  {t("education.videos.cancelUpload")}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={uploading || !selectedFile}
                onClick={() => void handleUpload()}
              >
                <Upload className="size-4" />
                {uploading
                  ? t("education.form.videoUploading", {
                      percent: String(uploadProgress),
                    })
                  : t("education.form.videoUpload")}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : null}

      {loading ? (
        <p className="text-text-secondary">{t("education.videos.loading")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {videos.map((video) => (
            <article
              key={video.id}
              className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm"
            >
              <div className="relative aspect-video bg-muted">
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#2a1824] to-[#120810]">
                    <Play className="size-10 text-primary-foreground/80" />
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {video.title}
                  </h3>
                  <Badge variant="secondary">{video.category}</Badge>
                </div>
                {video.description ? (
                  <p className="line-clamp-2 text-sm text-text-secondary">
                    {video.description}
                  </p>
                ) : null}
                <p className="text-xs text-text-secondary">
                  {t("education.videos.uploadedOn", {
                    date: video.created_at
                      ? video.created_at.slice(0, 10)
                      : "—",
                  })}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(video)}
                  >
                    <Pencil className="size-3.5" />
                    {t("education.videos.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletingId === video.id}
                    onClick={() => void handleDelete(video.id)}
                  >
                    <Trash2 className="size-3.5" />
                    {deletingId === video.id
                      ? t("education.videos.deleting")
                      : t("education.videos.delete")}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !videos.length ? (
        <p className="text-text-secondary">{t("education.videos.empty")}</p>
      ) : null}
    </div>
  )
}
