"use client"

import Link from "next/link"
import { Play } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { getEducationVideos } from "@/services/education-videos"
import type { EducationVideoListItem } from "@/types/education-video"

export function EducationVideosListView() {
  const { t } = useLanguage()
  const [videos, setVideos] = React.useState<EducationVideoListItem[]>([])
  const [category, setCategory] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getEducationVideos({
          category: category || undefined,
        })
        if (!cancelled) {
          setVideos(data.education_videos)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getLocalizedApiError(error, t))
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
  }, [category, t])

  if (loading) {
    return <p className="text-text-secondary">{t("education.videos.loading")}</p>
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={t("education.filterPlaceholder")}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="max-w-sm rounded-full"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {videos.map((video) => (
          <article
            key={video.id}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
          >
            <Link
              href={`/education/videos/${video.id}`}
              className="relative block aspect-video overflow-hidden bg-gradient-to-br from-[#2a1824] to-[#120810]"
            >
              {video.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail_url}
                  alt=""
                  className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              ) : null}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                  <Play className="size-6 fill-current" />
                </span>
              </span>
            </Link>
            <div className="border-b border-border/50 bg-muted/50 px-6 py-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold leading-snug text-text-primary">
                  {video.title}
                </h3>
                <Badge variant="secondary">{video.category}</Badge>
              </div>
              {video.created_at ? (
                <p className="mt-1 text-xs text-text-secondary">
                  {t("education.videos.uploadedOn", {
                    date: video.created_at.slice(0, 10),
                  })}
                </p>
              ) : null}
            </div>
            <div className="p-6">
              {video.description ? (
                <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                  {video.description}
                </p>
              ) : null}
              <Link
                href={`/education/videos/${video.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {t("education.videos.watch")}
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!videos.length ? (
        <p className="text-text-secondary">{t("education.videos.empty")}</p>
      ) : null}
    </div>
  )
}
