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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getEducationVideo } from "@/services/education-videos"
import type { EducationVideo } from "@/types/education-video"

export function EducationVideoDetailView({ id }: { id: number }) {
  const { t } = useLanguage()
  const [video, setVideo] = React.useState<EducationVideo | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getEducationVideo(id)
        if (!cancelled) {
          setVideo(data.education_video)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getLocalizedApiError(error, t))
          setVideo(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, t])

  if (loading) {
    return (
      <p className="text-text-secondary">{t("education.videos.detailLoading")}</p>
    )
  }
  if (!video) {
    return (
      <p className="text-destructive">{t("education.videos.detailNotFound")}</p>
    )
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-border/50 bg-muted/50">
        <div className="flex items-center gap-2">
          <Badge>{video.category}</Badge>
          {video.created_at ? (
            <span className="text-sm text-text-secondary">
              {video.created_at.slice(0, 10)}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-3xl text-text-primary">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <video
          src={video.video_url}
          controls
          playsInline
          preload="metadata"
          poster={video.thumbnail_url ?? undefined}
          className="aspect-video w-full rounded-xl bg-black"
        >
          {t("education.detail.videoUnsupported")}
        </video>
        {video.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {video.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
