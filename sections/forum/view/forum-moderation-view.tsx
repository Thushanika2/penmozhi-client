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
import { getApiErrorMessage } from "@/lib/api-client"
import { deleteForumPost, getForumPosts } from "@/services/forum"
import type { ForumPost } from "@/types/forum-post"

export function ForumModerationView() {
  const [posts, setPosts] = React.useState<ForumPost[]>([])
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

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

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteForumPost(deleteId)
      toast.success("Post removed")
      setDeleteId(null)
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Forum Moderation"
        description="Review and remove inappropriate community posts"
      />
      <Card>
        <CardHeader>
          <CardTitle>All posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.posted_at?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {post.author_display ?? "Anonymous"}
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
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove post?</DialogTitle>
                            <DialogDescription>
                              This will permanently delete &quot;{post.title}&quot;.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                              Remove
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
