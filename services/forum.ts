import apiClient from "@/lib/api-client"
import type { ForumComment, ForumPost } from "@/types/forum-post"

export interface CreateForumPostPayload {
  title: string
  body: string
  content_id?: number | null
}

export interface UpdateForumPostPayload {
  title?: string
  body?: string
  content_id?: number | null
}

export interface CreateForumCommentPayload {
  body: string
}

export async function getForumPosts() {
  const { data } = await apiClient.get<{ forum_posts: ForumPost[] }>("/api/forum")
  return data
}

export async function getForumPost(id: number) {
  const { data } = await apiClient.get<{ forum_post: ForumPost }>(`/api/forum/${id}`)
  return data
}

export async function createForumPost(payload: CreateForumPostPayload) {
  const { data } = await apiClient.post<{
    message: string
    forum_post: ForumPost
  }>("/api/forum", payload)
  return data
}

export async function updateForumPost(id: number, payload: UpdateForumPostPayload) {
  const { data } = await apiClient.put<{
    message: string
    forum_post: ForumPost
  }>(`/api/forum/${id}`, payload)
  return data
}

export async function deleteForumPost(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(`/api/forum/${id}`)
  return data
}

export async function createForumComment(
  postId: number,
  payload: CreateForumCommentPayload,
) {
  const { data } = await apiClient.post<{
    message: string
    forum_comment: ForumComment
  }>(`/api/forum/${postId}/comments`, payload)
  return data
}
