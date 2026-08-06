"use client"

import * as React from "react"
import {
  Activity,
  CalendarDays,
  HeartPulse,
  Info,
  Plus,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"
import { getChatHistory, getChats, sendChatMessage } from "@/services/ai-assistant"
import type { AIChatListItem, AIChatMessage } from "@/types/ai-assistant"

const EXAMPLE_PROMPTS: { key: string; icon: LucideIcon }[] = [
  { key: "nextPeriod", icon: CalendarDays },
  { key: "stomachPain", icon: HeartPulse },
  { key: "pcosSymptoms", icon: Info },
  { key: "cycleLength", icon: Activity },
]

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
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
    </div>
  )
}

function formatChatDate(value: string | null, locale: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function AIAssistantView() {
  const { t, locale } = useLanguage()
  const [message, setMessage] = React.useState("")
  const [chat, setChat] = React.useState<AIChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null)
  const [chats, setChats] = React.useState<AIChatListItem[]>([])
  const [sending, setSending] = React.useState(false)
  const [loadingHistory, setLoadingHistory] = React.useState(true)
  const [isNewConversation, setIsNewConversation] = React.useState(false)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)

  async function refreshChatList() {
    const data = await getChats()
    setChats(data.chats)
  }

  React.useEffect(() => {
    async function load() {
      setLoadingHistory(true)
      try {
        const results = await Promise.allSettled([getChats(), getChatHistory()])
        const chatListResult = results[0]
        const historyResult = results[1]

        if (chatListResult.status === "fulfilled") {
          setChats(chatListResult.value.chats)
        } else {
          toast.error(getLocalizedApiError(chatListResult.reason, t))
        }

        if (historyResult.status === "fulfilled") {
          const historyData = historyResult.value
          if (historyData.session_id && historyData.messages.length) {
            setActiveSessionId(historyData.session_id)
            setChat(historyData.messages)
            setIsNewConversation(false)
          } else {
            setActiveSessionId(null)
            setChat([])
            setIsNewConversation(true)
          }
        } else if (chatListResult.status === "fulfilled") {
          // History failed but chat list worked — start empty rather than blocking the page.
          setActiveSessionId(null)
          setChat([])
          setIsNewConversation(true)
          toast.error(getLocalizedApiError(historyResult.reason, t))
        }
      } finally {
        setLoadingHistory(false)
      }
    }
    void load()
  }, [t])

  React.useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [chat, sending])

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
    setMessage("")
  }

  async function sendUserMessage(userMessage: string) {
    if (!userMessage.trim() || sending) return

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
      await refreshChatList()
    } catch (error) {
      setChat((prev) => prev.slice(0, -1))
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSending(false)
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()
    await sendUserMessage(message.trim())
  }

  async function handleOptionSelect(option: string) {
    await sendUserMessage(option)
  }

  const lastMessageIndex = chat.length - 1
  const showExampleChips = !loadingHistory && chat.length === 0 && !sending

  return (
    <div>
      <PageHeader
        title={t("aiAssistant.title")}
        description={t("aiAssistant.description")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <Card className="h-fit border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
            <CardTitle className="text-base text-text-primary">
              {t("aiAssistant.chatHistory")}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={startNewChat}
            >
              <Plus className="size-4" />
              {t("aiAssistant.newChat")}
            </Button>
          </CardHeader>
          <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {loadingHistory && !chats.length ? (
              <p className="text-sm text-text-secondary">{t("aiAssistant.loadingHistory")}</p>
            ) : chats.length ? (
              chats.map((item) => {
                const selected = !isNewConversation && activeSessionId === item.chat_id
                return (
                  <button
                    key={item.chat_id}
                    type="button"
                    onClick={() => void loadSession(item.chat_id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-primary/45 bg-primary/10 shadow-sm"
                        : "border-border bg-background/40 hover:border-primary/30 hover:bg-muted/60",
                    )}
                  >
                    <p className="text-xs font-medium text-text-secondary">
                      {formatChatDate(item.last_message_at, locale)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-text-primary">
                      {item.title || t("aiAssistant.sessionFallback")}
                    </p>
                  </button>
                )
              })
            ) : (
              <p className="text-sm text-text-secondary">{t("aiAssistant.noSessions")}</p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Sparkles className="size-5 text-text-accent" />
              {t("aiAssistant.chat")}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full lg:hidden"
              onClick={startNewChat}
            >
              <Plus className="size-4" />
              {t("aiAssistant.newChat")}
            </Button>
          </CardHeader>
          <CardContent>
            <div
              ref={chatScrollRef}
              className="mb-4 max-h-[28rem] min-h-[16rem] space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/40 p-4"
            >
              {loadingHistory ? (
                <p className="text-sm text-text-secondary">
                  {t("aiAssistant.loadingHistory")}
                </p>
              ) : !chat.length ? (
                <p className="text-sm text-text-secondary">{t("aiAssistant.emptyChat")}</p>
              ) : (
                <>
                  {chat.map((entry, index) => {
                    const isAssistant = entry.role === "assistant"
                    const options = entry.options ?? []
                    const showOptions =
                      isAssistant &&
                      entry.response_type === "clarify" &&
                      options.length > 0 &&
                      index === lastMessageIndex &&
                      !sending

                    return (
                      <div key={`${entry.role}-${index}`} className="space-y-2">
                        <div
                          className={
                            entry.role === "user"
                              ? "ml-auto max-w-[85%] rounded-2xl bg-primary/15 p-3 text-sm text-text-primary"
                              : "max-w-[85%] rounded-2xl bg-background/70 p-3 text-sm text-text-primary"
                          }
                        >
                          {entry.content}
                        </div>
                        {showOptions ? (
                          <div className="flex max-w-[95%] flex-wrap gap-2">
                            {options.map((option) => (
                              <Button
                                key={option}
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-full border-primary/35 bg-muted text-text-primary hover:bg-primary/15 hover:text-text-primary"
                                disabled={sending}
                                onClick={() => void handleOptionSelect(option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  {sending ? <TypingIndicator label={t("aiAssistant.typing")} /> : null}
                </>
              )}
            </div>

            {showExampleChips ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(({ key, icon: Icon }) => {
                  const prompt = t(`aiAssistant.examplePrompts.${key}`)
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={sending}
                      onClick={() => void sendUserMessage(prompt)}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-left text-xs text-text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50"
                    >
                      <Icon className="size-3.5 shrink-0 text-text-accent" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("aiAssistant.inputPlaceholder")}
                disabled={sending || loadingHistory}
                className="rounded-full text-text-primary placeholder:text-text-secondary"
              />
              <Button
                type="submit"
                disabled={sending || loadingHistory || !message.trim()}
                className="rounded-full"
              >
                <Send className="size-4" />
                {t("aiAssistant.send")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
