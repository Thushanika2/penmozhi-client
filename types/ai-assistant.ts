export interface AIHealthAssistantSession {
  id: number
  profile_id: number
  symptom_analysis_log: string | null
  generated_recommendations: string | null
  posted_messages: string | null
  saved_chat_sessions: string | null
  created_at: string | null
}

export interface AIChatResponse {
  message: string
  reply: string
  recommendations: string[]
  session: AIHealthAssistantSession
}
