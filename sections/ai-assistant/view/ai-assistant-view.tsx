"use client"

import * as React from "react"
import { Plus, Send, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import {
  getChatHistory,
  getRecommendations,
  getSessions,
  sendChatMessage,
} from "@/services/ai-assistant"
import type { AIChatMessage, AIHealthAssistantSession } from "@/types/ai-assistant"

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="max-w-[85%] rounded-lg bg-muted p-3 text-sm">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:300ms]" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function AIAssistantView() {
  const { t } = useLanguage()
  const [message, setMessage] = React.useState("")
  const [chat, setChat] = React.useState<AIChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null)
  const [recommendations, setRecommendations] = React.useState<string[]>([])
  const [sessions, setSessions] = React.useState<AIHealthAssistantSession[]>([])
  const [sending, setSending] = React.useState(false)
  const [loadingHistory, setLoadingHistory] = React.useState(true)
  const [isNewConversation, setIsNewConversation] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      setLoadingHistory(true)
      try {
        const [recData, sessionData, historyData] = await Promise.all([
          getRecommendations(),
          getSessions(),
          getChatHistory(),
        ])
        setRecommendations(recData.recommendations)
        setSessions(sessionData.sessions)
        setActiveSessionId(historyData.session_id)
        setChat(historyData.messages)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      } finally {
        setLoadingHistory(false)
      }
    }
    load()
  }, [t])

  async function loadSession(sessionId: number) {
    setLoadingHistory(true)
    try {
      const historyData = await getChatHistory(sessionId)
      setActiveSessionId(historyData.session_id)
      setChat(historyData.messages)
      setIsNewConversation(false)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoadingHistory(false)
    }
  }

  function startNewChat() {
    setActiveSessionId(null)
    setChat([])
    setIsNewConversation(true)
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    if (!message.trim() || sending) return

    const userMessage = message.trim()
    setMessage("")
    setChat((prev) => [...prev, { role: "user", content: userMessage }])
    setSending(true)

    try {
      const data = await sendChatMessage({
        message: userMessage,
        chat_id: activeSessionId,
        session_id: activeSessionId,
        new_session: isNewConversation || activeSessionId == null,
      })
      setChat(data.messages)
      setActiveSessionId(data.chat_id ?? data.session_id)
      setIsNewConversation(false)
      if (data.recommendations.length) {
        setRecommendations((prev) => {
          const merged = [...data.recommendations, ...prev]
          return merged.filter((item, index) => merged.indexOf(item) === index)
        })
      }
      setSessions((prev) => {
        const withoutCurrent = prev.filter((session) => session.id !== data.session.id)
        return [data.session, ...withoutCurrent]
      })
    } catch (error) {
      setChat((prev) => prev.slice(0, -1))
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={t("aiAssistant.title")}
        description={t("aiAssistant.description")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {t("aiAssistant.chat")}
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={startNewChat}>
              <Plus className="size-4" />
              {t("aiAssistant.newChat")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border p-4">
              {loadingHistory ? (
                <p className="text-sm text-muted-foreground">
                  {t("aiAssistant.loadingHistory")}
                </p>
              ) : !chat.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("aiAssistant.emptyChat")}
                </p>
              ) : (
                <>
                  {chat.map((entry, index) => (
                    <div
                      key={`${entry.role}-${index}`}
                      className={
                        entry.role === "user"
                          ? "ml-auto max-w-[85%] rounded-lg bg-primary/10 p-3 text-sm"
                          : "max-w-[85%] rounded-lg bg-muted p-3 text-sm"
                      }
                    >
                      {entry.content}
                    </div>
                  ))}
                  {sending ? <TypingIndicator label={t("aiAssistant.typing")} /> : null}
                </>
              )}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("aiAssistant.inputPlaceholder")}
                disabled={sending || loadingHistory}
              />
              <Button type="submit" disabled={sending || loadingHistory}>
                <Send className="size-4" />
                {t("aiAssistant.send")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("aiAssistant.recommendations")}</CardTitle>
              <CardDescription>{t("aiAssistant.recommendationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendations.length ? (
                recommendations.slice(0, 5).map((rec, i) => (
                  <p key={i} className="rounded-lg bg-muted p-2 text-sm">
                    {rec}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("aiAssistant.noRecommendations")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("aiAssistant.recentSessions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.length ? (
                sessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => loadSession(session.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/70 ${
                      activeSessionId === session.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Badge variant="outline" className="mb-1">
                      {session.created_at?.slice(0, 10)}
                    </Badge>
                    <p className="line-clamp-2 text-muted-foreground">
                      {session.preview ?? t("aiAssistant.sessionFallback")}
                    </p>
                    {session.message_count ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("aiAssistant.messageCount", { count: session.message_count })}
                      </p>
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("aiAssistant.noSessions")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
