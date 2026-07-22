"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import { deleteForumPost, getForumPosts } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

export function ForumModerationView() {
  const { t } = useLanguage()
  const [posts, setPosts] = React.useState<ForumPost[]>([])
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

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

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteForumPost(deleteId)
      toast.success(t("forum.moderation.postRemoved"))
      setDeleteId(null)
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <PageHeader
        title={t("forum.moderation.title")}
        description={t("forum.moderation.description")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("forum.moderation.allPosts")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("forum.moderation.titleColumn")}</TableHead>
                  <TableHead>{t("forum.moderation.postedColumn")}</TableHead>
                  <TableHead>{t("forum.moderation.authorColumn")}</TableHead>
                  <TableHead className="text-right">
                    {t("forum.moderation.actionsColumn")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.posted_at?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {post.author_display ?? t("forum.anonymous")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog
                        open={deleteId === post.id}
                        onOpenChange={(open) => setDeleteId(open ? post.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="size-4" />
                            {t("forum.moderation.remove")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("forum.moderation.removePostTitle")}</DialogTitle>
                            <DialogDescription>
                              {t("forum.moderation.removePostDescription", {
                                title: post.title,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                              {t("common.cancel")}
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                              {t("forum.moderation.remove")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
