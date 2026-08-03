export type AIResponseType = "answer" | "clarify"

export interface AIChatMessage {
  role: "user" | "assistant"
  content: string
  response_type?: AIResponseType
  options?: string[]
}

export interface AIHealthAssistantSession {
  id: number
  profile_id: number
  symptom_analysis_log: string | null
  generated_recommendations: string | null
  posted_messages: string | null
  saved_chat_sessions: string | null
  created_at: string | null
  updated_at?: string | null
  messages?: AIChatMessage[]
  message_count?: number
  preview?: string | null
}

export interface AIChatListItem {
  chat_id: number
  title: string
  last_message_at: string | null
  message_count?: number
}

export interface AIChatListResponse {
  chats: AIChatListItem[]
}

export interface AIChatResponse {
  message: string
  reply: string
  response_type?: AIResponseType
  options?: string[]
  recommendations?: string[]
  chat_id: number
  session_id: number
  messages: AIChatMessage[]
  session: AIHealthAssistantSession
}

export interface AIChatHistoryResponse {
  session_id: number | null
  messages: AIChatMessage[]
  session: AIHealthAssistantSession | null
}
