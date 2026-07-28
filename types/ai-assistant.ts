export interface AIChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface AIHealthAssistantSession {
  id: number
  profile_id: number
  symptom_analysis_log: string | null
  generated_recommendations: string | null
  posted_messages: string | null
  saved_chat_sessions: string | null
  created_at: string | null
  messages?: AIChatMessage[]
  message_count?: number
  preview?: string | null
}

export interface AIChatResponse {
  message: string
  reply: string
  recommendations: string[]
  session_id: number
  messages: AIChatMessage[]
  session: AIHealthAssistantSession
}

export interface AIChatHistoryResponse {
  session_id: number | null
  messages: AIChatMessage[]
  session: AIHealthAssistantSession | null
}
