"use client"

import * as React from "react"
import { Send, Sparkles } from "lucide-react"
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
  getRecommendations,
  getSessions,
  sendChatMessage,
} from "@/services/ai-assistant"
import type { AIHealthAssistantSession } from "@/types/ai-assistant"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function AIAssistantView() {
  const { t } = useLanguage()
  const [message, setMessage] = React.useState("")
  const [chat, setChat] = React.useState<ChatMessage[]>([])
  const [recommendations, setRecommendations] = React.useState<string[]>([])
  const [sessions, setSessions] = React.useState<AIHealthAssistantSession[]>([])
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const [recData, sessionData] = await Promise.all([
          getRecommendations(),
          getSessions(),
        ])
        setRecommendations(recData.recommendations)
        setSessions(sessionData.sessions)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      }
    }
    load()
  }, [t])

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    if (!message.trim()) return

    const userMessage = message.trim()
    setMessage("")
    setChat((prev) => [...prev, { role: "user", content: userMessage }])
    setSending(true)

    try {
      const data = await sendChatMessage({ message: userMessage })
      setChat((prev) => [...prev, { role: "assistant", content: data.reply }])
      if (data.recommendations.length) {
        setRecommendations((prev) => [...data.recommendations, ...prev])
      }
      setSessions((prev) => [data.session, ...prev])
    } catch (error) {
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {t("aiAssistant.chat")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border p-4">
              {!chat.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("aiAssistant.emptyChat")}
                </p>
              ) : (
                chat.map((entry, index) => (
                  <div
                    key={index}
                    className={
                      entry.role === "user"
                        ? "ml-auto max-w-[85%] rounded-lg bg-primary/10 p-3 text-sm"
                        : "max-w-[85%] rounded-lg bg-muted p-3 text-sm"
                    }
                  >
                    {entry.content}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("aiAssistant.inputPlaceholder")}
                disabled={sending}
              />
              <Button type="submit" disabled={sending}>
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
              {sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="text-sm">
                  <Badge variant="outline" className="mb-1">
                    {session.created_at?.slice(0, 10)}
                  </Badge>
                  <p className="line-clamp-2 text-muted-foreground">
                    {session.symptom_analysis_log ?? t("aiAssistant.sessionFallback")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
