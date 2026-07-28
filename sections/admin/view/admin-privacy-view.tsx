"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FadeIn } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminPrivacyIntegrations,
  useAdminPrivacyRequests,
  useAdminUserConsents,
} from "@/hooks/use-queries"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { completeAdminPrivacyRequest } from "@/services/admin"
import { useLanguage } from "@/providers/language-provider"

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "completed") return "secondary"
  if (status === "processing") return "outline"
  return "default"
}

export function AdminPrivacyView() {
  const { t, locale } = useLanguage()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [completingId, setCompletingId] = React.useState<number | null>(null)
  const [consentUserId, setConsentUserId] = React.useState("")
  const [consentLookupId, setConsentLookupId] = React.useState<number | null>(null)

  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
    error: requestsErr,
  } = useAdminPrivacyRequests(statusFilter)

  const {
    data: integrationsData,
    isLoading: integrationsLoading,
    isError: integrationsError,
    error: integrationsErr,
  } = useAdminPrivacyIntegrations()

  const {
    data: consentsData,
    isLoading: consentsLoading,
    isError: consentsError,
    error: consentsErr,
  } = useAdminUserConsents(consentLookupId)

  React.useEffect(() => {
    if (requestsError) toast.error(getLocalizedApiError(requestsErr, t))
  }, [requestsError, requestsErr, t])

  React.useEffect(() => {
    if (integrationsError) toast.error(getLocalizedApiError(integrationsErr, t))
  }, [integrationsError, integrationsErr, t])

  React.useEffect(() => {
    if (consentsError) toast.error(getLocalizedApiError(consentsErr, t))
  }, [consentsError, consentsErr, t])

  function formatDateTime(value: string | null) {
    if (!value) return "—"
    return new Date(value).toLocaleString(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  async function handleComplete(requestId: number) {
    setCompletingId(requestId)
    try {
      const result = await completeAdminPrivacyRequest(requestId)
      toast.success(t("admin.privacy.completeSuccess"))
      if (result.deletion_approach === "hard_delete") {
        toast.message(t("admin.privacy.deletionNote"))
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "privacy"] })
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setCompletingId(null)
    }
  }

  function handleConsentLookup(event: React.FormEvent) {
    event.preventDefault()
    const parsed = Number(consentUserId)
    if (!parsed || parsed <= 0) {
      toast.error(t("admin.privacy.consentUserIdRequired"))
      return
    }
    setConsentLookupId(parsed)
  }

  const requests = requestsData?.privacy_requests ?? []
  const integrations = integrationsData?.integrations ?? []

  return (
    <div>
      <FadeIn>
        <PageHeader
          title={t("admin.privacy.title")}
          description={t("admin.privacy.description")}
        />

        <Card className="mb-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.privacy.requestsTitle")}</CardTitle>
            <CardDescription>{t("admin.privacy.requestsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs">
              <Label htmlFor="privacy-status-filter">{t("admin.privacy.statusFilter")}</Label>
              <Select
                id="privacy-status-filter"
                className="mt-2 rounded-xl"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">{t("admin.privacy.statusAll")}</option>
                <option value="pending">{t("admin.privacy.statusPending")}</option>
                <option value="processing">{t("admin.privacy.statusProcessing")}</option>
                <option value="completed">{t("admin.privacy.statusCompleted")}</option>
              </Select>
            </div>

            {requestsLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.privacy.noRequests")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.privacy.columns.user")}</TableHead>
                    <TableHead>{t("admin.privacy.columns.type")}</TableHead>
                    <TableHead>{t("admin.privacy.columns.requested")}</TableHead>
                    <TableHead>{t("admin.privacy.columns.status")}</TableHead>
                    <TableHead>{t("admin.privacy.columns.completed")}</TableHead>
                    <TableHead className="text-right">{t("admin.privacy.columns.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.user_email}</div>
                        {request.user_id ? (
                          <div className="text-xs text-muted-foreground">ID {request.user_id}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>{t(`admin.privacy.requestType.${request.request_type}`)}</TableCell>
                      <TableCell>{formatDateTime(request.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(request.status)}>
                          {t(`admin.privacy.status.${request.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>{formatDateTime(request.completed_at)}</div>
                        {request.completed_by_admin_email ? (
                          <div className="text-xs text-muted-foreground">
                            {request.completed_by_admin_email}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status !== "completed" ? (
                          <Button
                            size="sm"
                            className="rounded-full"
                            disabled={completingId === request.id}
                            onClick={() => void handleComplete(request.id)}
                          >
                            {completingId === request.id
                              ? t("admin.privacy.completing")
                              : t("admin.privacy.markComplete")}
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.privacy.integrationsTitle")}</CardTitle>
            <CardDescription>{t("admin.privacy.integrationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {integrationsLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.privacy.integrationColumns.provider")}</TableHead>
                    <TableHead>{t("admin.privacy.integrationColumns.type")}</TableHead>
                    <TableHead>{t("admin.privacy.integrationColumns.data")}</TableHead>
                    <TableHead>{t("admin.privacy.integrationColumns.connected")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.provider}>
                      <TableCell className="font-medium">{integration.provider}</TableCell>
                      <TableCell>{integration.integration_type}</TableCell>
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        {integration.data_categories.join(", ")}
                      </TableCell>
                      <TableCell>{integration.connected_users}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.privacy.consentsTitle")}</CardTitle>
            <CardDescription>{t("admin.privacy.consentsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleConsentLookup} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="consent-user-id">{t("admin.privacy.consentUserId")}</Label>
                <Input
                  id="consent-user-id"
                  type="number"
                  min={1}
                  value={consentUserId}
                  onChange={(event) => setConsentUserId(event.target.value)}
                  placeholder="123"
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="rounded-full">
                {t("admin.privacy.lookupConsents")}
              </Button>
            </form>

            {consentLookupId && consentsLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : null}

            {consentsData ? (
              <div className="space-y-3">
                <p className="text-sm">
                  {t("admin.privacy.consentForUser", {
                    email: consentsData.user_email,
                    id: String(consentsData.user_id),
                  })}
                </p>
                {consentsData.consents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("admin.privacy.noConsents")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.privacy.consentColumns.type")}</TableHead>
                        <TableHead>{t("admin.privacy.consentColumns.version")}</TableHead>
                        <TableHead>{t("admin.privacy.consentColumns.granted")}</TableHead>
                        <TableHead>{t("admin.privacy.consentColumns.context")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consentsData.consents.map((consent) => (
                        <TableRow key={consent.id}>
                          <TableCell>{consent.consent_type}</TableCell>
                          <TableCell>{consent.policy_version}</TableCell>
                          <TableCell>{formatDateTime(consent.granted_at)}</TableCell>
                          <TableCell>{consent.context ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
