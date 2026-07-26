"use client"

import Link from "next/link"
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
import { useCycleShares } from "@/hooks/use-queries"
import { acceptCycleShare, createCycleShare, revokeCycleShare } from "@/services/cycle-share"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

export function SharingView() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading } = useCycleShares()
  const shares = data?.cycle_shares ?? []
  const [email, setEmail] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setSaving(true)
    try {
      await createCycleShare({
        shared_with_email: email.trim(),
        permissions: { cycle: true, symptoms: false },
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.cycleShares.list })
      setEmail("")
      toast.success(t("sharing.inviteSent"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSaving(false)
    }
  }

  async function handleAccept(id: number) {
    try {
      await acceptCycleShare(id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.cycleShares.list })
      toast.success(t("sharing.accepted"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function handleRevoke(id: number) {
    try {
      await revokeCycleShare(id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.cycleShares.list })
      toast.success(t("sharing.revoked"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <PageHeader title={t("sharing.title")} description={t("sharing.description")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sharing.invite.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="share-email">{t("sharing.invite.email")}</Label>
                <Input
                  id="share-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                />
              </div>
              <Button type="submit" className="self-end" disabled={saving}>
                {t("sharing.invite.send")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("sharing.list.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : shares.length ? (
              <ul className="space-y-3">
                {shares.map((share) => {
                  const isOwner = share.owner_profile_id === user?.id
                  const isRecipient =
                    share.shared_with_email.toLowerCase() === user?.email.toLowerCase()
                  return (
                    <li key={share.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span>{isOwner ? share.shared_with_email : t("sharing.fromOwner")}</span>
                        <Badge>{share.status}</Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {isRecipient && share.status === "pending" ? (
                          <Button size="sm" onClick={() => handleAccept(share.id)}>
                            {t("sharing.accept")}
                          </Button>
                        ) : null}
                        {isOwner && share.status !== "revoked" ? (
                          <Button size="sm" variant="outline" onClick={() => handleRevoke(share.id)}>
                            {t("sharing.revoke")}
                          </Button>
                        ) : null}
                        {share.status === "accepted" && isRecipient ? (
                          <Link
                            href={`/shared/${share.id}`}
                            className="inline-flex h-8 items-center rounded-md bg-secondary px-3 text-xs font-medium"
                          >
                            {t("sharing.view")}
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("sharing.list.empty")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
