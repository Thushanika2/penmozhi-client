"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { usePregnancyProfile } from "@/hooks/use-queries"
import { updatePregnancyProfile } from "@/services/pregnancy-profile"
import { useLanguage } from "@/providers/language-provider"

export function PregnancyView() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data, isLoading } = usePregnancyProfile()
  const profile = data?.pregnancy_profile
  const profileLmp = profile?.last_menstrual_period ?? ""
  const [editedLmp, setEditedLmp] = React.useState<string | null>(null)
  const lmp = editedLmp ?? profileLmp
  const [saving, setSaving] = React.useState(false)

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!lmp) return
    setSaving(true)
    try {
      await updatePregnancyProfile({ last_menstrual_period: lmp })
      await queryClient.invalidateQueries({ queryKey: queryKeys.pregnancy.profile })
      setEditedLmp(null)
      toast.success(t("pregnancy.saved"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={t("pregnancy.title")} description={t("pregnancy.description")} />
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("pregnancy.profile.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lmp">{t("pregnancy.profile.lmp")}</Label>
                  <Input id="lmp" type="date" value={lmp} onChange={(e) => setEditedLmp(e.target.value)} />
                </div>
                <Button type="submit" disabled={saving || !lmp}>
                  {saving ? t("common.saving") : t("common.save")}
                </Button>
              </form>
            </CardContent>
          </Card>
          {profile ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("pregnancy.summary.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  {t("pregnancy.summary.dueDate")}: <strong>{profile.due_date}</strong>
                </p>
                <p>
                  {t("pregnancy.summary.trimester")}:{" "}
                  <Badge>{profile.current_trimester}</Badge>
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
