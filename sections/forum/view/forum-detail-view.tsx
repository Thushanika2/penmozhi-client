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
import { getApiErrorMessage } from "@/lib/api-client"
import { createForumComment, getForumPost } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

const schema = z.object({
  body: z.string().min(3, "Comment is required"),
})

type FormValues = z.infer<typeof schema>

export function ForumDetailView({ id }: { id: number }) {
  const [post, setPost] = React.useState<ForumPost | null>(null)
  const [loading, setLoading] = React.useState(true)

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
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadPost()
  }, [id])

  async function onSubmit(values: FormValues) {
    try {
      await createForumComment(id, { body: values.body })
      toast.success("Comment posted anonymously")
      reset()
      await loadPost()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading post...</p>
  if (!post) return <p className="text-destructive">Post not found.</p>

  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/dashboard/forum" />}>
        Back to forum
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{post.author_display ?? "Anonymous"}</Badge>
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
          <CardTitle>Comments ({post.comments?.length ?? 0})</CardTitle>
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
              placeholder="Write an anonymous comment..."
              rows={3}
              {...register("body")}
            />
            {errors.body ? (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post comment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
