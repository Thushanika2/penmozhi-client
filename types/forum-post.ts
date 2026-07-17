export interface ForumComment {
  id: number
  post_id: number
  profile_id: number | null
  body: string
  posted_at: string | null
  created_at: string | null
  author_display: string
}

export interface ForumPost {
  id: number
  profile_id: number | null
  content_id: number | null
  title: string
  body: string
  posted_at: string | null
  created_at: string | null
  author_display: string | null
  comments?: ForumComment[]
}
