export interface EducationalResource {
  id: number
  article_title: string
  content_category: string
  content_body: string
  language: "english" | "tamil"
  publication_date: string
  created_at: string | null
}
