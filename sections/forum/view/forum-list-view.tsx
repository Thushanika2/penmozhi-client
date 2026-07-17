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
import { getApiErrorMessage } from "@/lib/api-client"
import { createForumPost, getForumPosts } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  body: z.string().min(10, "Body is required"),
})

type FormValues = z.infer<typeof schema>

export function ForumListView() {
  const [posts, setPosts] = React.useState<ForumPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function loadData() {
    try {
      const data = await getForumPosts()
      setPosts(data.forum_posts)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      await createForumPost({
        title: values.title,
        body: values.body,
      })
      toast.success("Post created (displayed anonymously)")
      reset()
      setShowForm(false)
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader
          title="Community Forum"
          description="Share experiences anonymously with the community"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          New post
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create post</CardTitle>
            <CardDescription>Your identity will not be shown publicly</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...register("title")} />
                {errors.title ? (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea rows={5} {...register("body")} />
                {errors.body ? (
                  <p className="text-sm text-destructive">{errors.body.message}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post anonymously"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : null}

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading posts...</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {post.author_display ?? "Anonymous"} ·{" "}
                      {post.posted_at?.slice(0, 10)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/dashboard/forum/${post.id}`} />}
                  >
                    <Eye className="size-4" />
                    View
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
