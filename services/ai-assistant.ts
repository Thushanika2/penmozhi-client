import apiClient from "@/lib/api-client"
import type { AIChatResponse, AIHealthAssistantSession } from "@/types/ai-assistant"

export interface ChatPayload {
  message: string
}

export async function sendChatMessage(payload: ChatPayload) {
  const { data } = await apiClient.post<AIChatResponse>(
    "/api/ai-assistant/chat",
    payload,
  )
  return data
}

export async function getRecommendations() {
  const { data } = await apiClient.get<{ recommendations: string[] }>(
    "/api/ai-assistant/recommendations",
  )
  return data
}

export async function getSessions() {
  const { data } = await apiClient.get<{ sessions: AIHealthAssistantSession[] }>(
    "/api/ai-assistant/sessions",
  )
  return data
}
