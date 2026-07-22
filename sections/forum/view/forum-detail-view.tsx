"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { createForumComment, getForumPost } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

interface FormValues {
  body: string
}

export function ForumDetailView({ id }: { id: number }) {
  const { t } = useLanguage()
  const [post, setPost] = React.useState<ForumPost | null>(null)
  const [loading, setLoading] = React.useState(true)

  const schema = React.useMemo(
    () =>
      z.object({
        body: z.string().min(3, t("forum.validation.commentRequired")),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function loadPost() {
    try {
      const data = await getForumPost(id)
      setPost(data.forum_post)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getForumPost(id)
        setPost(data.forum_post)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id, t])

  async function onSubmit(values: FormValues) {
    try {
      await createForumComment(id, { body: values.body })
      toast.success(t("forum.detail.commentPosted"))
      reset()
      await loadPost()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  if (loading)
    return <p className="text-muted-foreground">{t("forum.detail.loadingPost")}</p>
  if (!post)
    return <p className="text-destructive">{t("forum.detail.postNotFound")}</p>

  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/dashboard/forum" />}>
        {t("forum.detail.backToForum")}
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {post.author_display ?? t("forum.anonymous")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {post.posted_at?.slice(0, 10)}
            </span>
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.body}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("forum.detail.comments", { count: post.comments?.length ?? 0 })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-3">
              <p className="mb-1 text-xs text-muted-foreground">
                {comment.author_display} · {comment.posted_at?.slice(0, 10)}
              </p>
              <p className="text-sm">{comment.body}</p>
            </div>
          ))}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Textarea
              placeholder={t("forum.detail.commentPlaceholder")}
              rows={3}
              {...register("body")}
            />
            {errors.body ? (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("forum.list.posting") : t("forum.detail.postComment")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
