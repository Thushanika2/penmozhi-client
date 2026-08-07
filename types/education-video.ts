export interface EducationVideoListItem {
  id: number
  title: string
  description: string | null
  thumbnail_url: string | null
  category: string
  created_at: string | null
  updated_at: string | null
}

export interface EducationVideo extends EducationVideoListItem {
  video_url: string
  video_public_id?: string
  created_by_admin_id?: number
}

/** Same free-text category values used by educational articles. */
export const EDUCATION_CATEGORIES = [
  "puberty",
  "cycle",
  "hygiene",
  "pcos",
  "nutrition",
  "mental_health",
  "wellness",
  "reproductive_health",
  "fertility",
] as const
