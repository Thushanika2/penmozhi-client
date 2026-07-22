"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { Eye, Plus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { createForumPost, getForumPosts } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

interface FormValues {
  title: string
  body: string
}

export function ForumListView() {
  const { t } = useLanguage()
  const [posts, setPosts] = React.useState<ForumPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)

  const schema = React.useMemo(
    () =>
      z.object({
        title: z.string().min(3, t("forum.validation.titleRequired")),
        body: z.string().min(10, t("forum.validation.bodyRequired")),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getForumPosts()
        if (cancelled) return
        setPosts(data.forum_posts)
      } catch (error) {
        if (!cancelled) toast.error(getLocalizedApiError(error, t))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [t])

  async function loadData() {
    try {
      const data = await getForumPosts()
      setPosts(data.forum_posts)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await createForumPost({
        title: values.title,
        body: values.body,
      })
      toast.success(t("forum.list.postCreated"))
      reset()
      setShowForm(false)
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader
          title={t("forum.list.title")}
          description={t("forum.list.description")}
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          {t("forum.list.newPost")}
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("forum.list.createPost")}</CardTitle>
            <CardDescription>{t("forum.list.createPostDescription")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forum.list.titleLabel")}</Label>
                <Input {...register("title")} />
                {errors.title ? (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>{t("forum.list.bodyLabel")}</Label>
                <Textarea rows={5} {...register("body")} />
                {errors.body ? (
                  <p className="text-sm text-destructive">{errors.body.message}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("forum.list.posting")
                    : t("forum.list.postAnonymously")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : null}

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">{t("forum.list.loadingPosts")}</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {post.author_display ?? t("forum.anonymous")} ·{" "}
                      {post.posted_at?.slice(0, 10)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/dashboard/forum/${post.id}`} />}
                  >
                    <Eye className="size-4" />
                    {t("forum.list.view")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
