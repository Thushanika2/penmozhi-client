import apiClient from "@/lib/api-client"
import type {
  AIChatHistoryResponse,
  AIChatListResponse,
  AIChatResponse,
} from "@/types/ai-assistant"

export interface ChatPayload {
  message: string
  chat_id?: number | null
  session_id?: number | null
  new_session?: boolean
}

const AI_CHAT_TIMEOUT_MS = 60_000

export async function sendChatMessage(payload: ChatPayload) {
  const { data } = await apiClient.post<AIChatResponse>(
    "/api/ai-assistant/chat",
    payload,
    { timeout: AI_CHAT_TIMEOUT_MS },
  )
  return data
}

export async function getChatHistory(sessionId?: number) {
  const { data } = await apiClient.get<AIChatHistoryResponse>(
    "/api/ai-assistant/history",
    sessionId != null ? { params: { session_id: sessionId } } : undefined,
  )
  return data
}

export async function getChats() {
  const { data } = await apiClient.get<AIChatListResponse>("/api/ai-assistant/chats")
  return data
}
