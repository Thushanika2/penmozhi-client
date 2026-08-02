"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { useWearables } from "@/hooks/use-queries"
import { connectWearable, disconnectWearable } from "@/services/wearable"
import { useLanguage } from "@/providers/language-provider"

const PROVIDERS = ["oura", "whoop", "fitbit", "withings", "garmin"]

export function WearablesView() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data, isLoading } = useWearables()
  const connections = data?.wearable_connections ?? []

  async function handleConnect(provider: string) {
    try {
      const result = await connectWearable(provider)
      if (result.redirect_url) {
        window.location.href = result.redirect_url
      } else {
        toast.info(t("wearables.stubMessage"))
      }
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function handleDisconnect(provider: string) {
    try {
      await disconnectWearable(provider)
      await queryClient.invalidateQueries({ queryKey: queryKeys.wearables.list })
      toast.success(t("wearables.disconnected"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <div>
      <PageHeader title={t("wearables.title")} description={t("wearables.description")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("wearables.providers.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : (
            PROVIDERS.map((provider) => {
              const connected = connections.find((c) => c.provider === provider)
              return (
                <div
                  key={provider}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium capitalize">{provider}</p>
                    {connected?.last_synced_at ? (
                      <p className="text-xs text-muted-foreground">
                        {t("wearables.lastSynced")}: {connected.last_synced_at.slice(0, 10)}
                      </p>
                    ) : null}
                  </div>
                  {connected ? (
                    <div className="flex items-center gap-2">
                      <Badge>{t("wearables.connected")}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider)}>
                        {t("wearables.disconnect")}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(provider)}>
                      {t("wearables.connect")}
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
