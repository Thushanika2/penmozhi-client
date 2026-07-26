"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { usePerimenopauseLogs } from "@/hooks/use-queries"
import { createPerimenopauseLog } from "@/services/perimenopause-log"
import { useLanguage } from "@/providers/language-provider"
import type { PerimenopauseLog } from "@/types/perimenopause-log"

export function PerimenopauseView() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data, isLoading } = usePerimenopauseLogs()
  const logs: PerimenopauseLog[] = data?.perimenopause_logs ?? []
  const [logDate, setLogDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [hotFlashes, setHotFlashes] = React.useState(false)
  const [nightSweats, setNightSweats] = React.useState(false)
  const [sleepDisruption, setSleepDisruption] = React.useState(false)
  const [moodChanges, setMoodChanges] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await createPerimenopauseLog({
        log_date: logDate,
        hot_flashes: hotFlashes,
        night_sweats: nightSweats,
        sleep_disruption: sleepDisruption,
        mood_changes: moodChanges || null,
        notes: notes || null,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.perimenopause.list })
      toast.success(t("perimenopause.saved"))
      setNotes("")
      setMoodChanges("")
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={t("perimenopause.title")} description={t("perimenopause.description")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("perimenopause.form.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("perimenopause.form.date")}</Label>
                <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hotFlashes} onChange={(e) => setHotFlashes(e.target.checked)} />
                {t("perimenopause.form.hotFlashes")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={nightSweats} onChange={(e) => setNightSweats(e.target.checked)} />
                {t("perimenopause.form.nightSweats")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sleepDisruption}
                  onChange={(e) => setSleepDisruption(e.target.checked)}
                />
                {t("perimenopause.form.sleepDisruption")}
              </label>
              <div className="space-y-2">
                <Label>{t("perimenopause.form.moodChanges")}</Label>
                <Input value={moodChanges} onChange={(e) => setMoodChanges(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("perimenopause.form.notes")}</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("perimenopause.history.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : logs.length ? (
              <ul className="space-y-3 text-sm">
                {logs.map((log) => (
                  <li key={log.id} className="rounded-lg border border-border p-3">
                    <p className="font-medium">{log.log_date}</p>
                    <p className="text-muted-foreground">
                      {[log.hot_flashes && t("perimenopause.form.hotFlashes"), log.night_sweats && t("perimenopause.form.nightSweats")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("perimenopause.history.empty")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
