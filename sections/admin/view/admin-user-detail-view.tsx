"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FadeIn } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useAdminUserDetail } from "@/hooks/use-queries"
import {
  forceAdminUserLogout,
  requestAdminUserDelete,
  toggleAdminUserSuspend,
  toggleAdminUserTestAccount,
  updateAdminUserStatus,
} from "@/services/admin"
import type { SubscriptionLabel, UserStatus } from "@/types/user-profile"
import { useLanguage } from "@/providers/language-provider"

function statusVariant(status: UserStatus): "default" | "secondary" | "destructive" {
  if (status === "active") return "default"
  if (status === "suspended") return "secondary"
  return "destructive"
}

function subscriptionVariant(label: SubscriptionLabel): "default" | "secondary" | "outline" | "destructive" {
  if (label === "premium") return "default"
  if (label === "trial") return "outline"
  if (label === "expired") return "destructive"
  return "secondary"
}

interface AdminUserDetailViewProps {
  userId: number
}

export function AdminUserDetailView({ userId }: AdminUserDetailViewProps) {
  const { t, locale } = useLanguage()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useAdminUserDetail(userId)
  const [statusDraft, setStatusDraft] = React.useState<UserStatus | null>(null)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  const statusValue = statusDraft ?? data?.user.status ?? "active"

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

  function formatDate(value: string | null) {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  async function refreshDetail() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  }

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setBusy(true)
    try {
      await action()
      toast.success(successMessage)
      setStatusDraft(null)
      await refreshDetail()
    } catch (err) {
      toast.error(getLocalizedApiError(err, t))
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>
  }

  if (!data) {
    return (
      <div>
        <p className="text-muted-foreground">{t("admin.users.detail.notFound")}</p>
        <Button variant="outline" className="mt-4 rounded-full" render={<Link href="/admin/users" />}>
          {t("admin.users.detail.backToList")}
        </Button>
      </div>
    )
  }

  const { user, subscription, payment_history, activity, consents, admin_action_logs } = data

  return (
    <div>
      <FadeIn>
        <PageHeader
          title={user.full_name}
          description={user.email}
          action={
            <Button variant="outline" className="rounded-full" render={<Link href="/admin/users" />}>
              {t("admin.users.detail.backToList")}
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.users.detail.profileTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.email")}</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.name")}</span>
                <span>{user.full_name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.language")}</span>
                <span>
                  {user.language_preference === "tamil" ? t("common.tamil") : t("common.english")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.country")}</span>
                <span>{user.country ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.registered")}</span>
                <span>{formatDate(user.registration_date)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.status")}</span>
                <Badge variant={statusVariant(user.status ?? "active")}>
                  {t(`admin.users.status.${user.status ?? "active"}`)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.users.detail.activityTitle")}</CardTitle>
              <CardDescription>{t("admin.users.detail.activityDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.lastActive")}</span>
                <span>{formatDateTime(activity.last_active_at)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.detail.loginCount")}</span>
                <span>{activity.login_count}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.onboarding")}</span>
                <Badge variant={activity.onboarding_completed ? "default" : "secondary"}>
                  {activity.onboarding_completed
                    ? t("admin.users.onboardingComplete")
                    : t("admin.users.onboardingPending")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.users.detail.subscriptionTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.columns.subscription")}</span>
                <Badge variant={subscriptionVariant(subscription.label)}>
                  {t(`admin.users.subscription.${subscription.label}`)}
                </Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.detail.plan")}</span>
                <span>{subscription.plan}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("admin.users.detail.periodEnd")}</span>
                <span>{formatDateTime(subscription.current_period_end)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("admin.users.detail.paymentTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {payment_history.implemented
                  ? t("admin.users.detail.paymentAvailable")
                  : payment_history.message}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.users.detail.adminActionsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {user.status !== "banned" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() =>
                    runAction(
                      () => toggleAdminUserSuspend(user.id),
                      user.status === "active"
                        ? t("admin.users.actions.suspendSuccess")
                        : t("admin.users.actions.unsuspendSuccess"),
                    )
                  }
                >
                  {user.status === "active"
                    ? t("admin.users.actions.suspend")
                    : t("admin.users.actions.unsuspend")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => forceAdminUserLogout(user.id),
                    t("admin.users.actions.forceLogoutSuccess"),
                  )
                }
              >
                {t("admin.users.actions.forceLogout")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    const result = await requestAdminUserDelete(user.id)
                    toast.success(t("admin.users.actions.deleteRequestSuccess"))
                    window.location.href = result.redirect_path
                  } catch (err) {
                    toast.error(getLocalizedApiError(err, t))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {t("admin.users.actions.delete")}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="detail-status">{t("admin.users.detail.setStatus")}</Label>
                <Select
                  id="detail-status"
                  value={statusValue}
                  onChange={(event) => setStatusDraft(event.target.value as UserStatus)}
                >
                  <option value="active">{t("admin.users.status.active")}</option>
                  <option value="suspended">{t("admin.users.status.suspended")}</option>
                  <option value="banned">{t("admin.users.status.banned")}</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  className="rounded-full"
                  disabled={busy || statusValue === user.status}
                  onClick={() =>
                    runAction(
                      () => updateAdminUserStatus(user.id, statusValue),
                      t("admin.users.detail.statusUpdated"),
                    )
                  }
                >
                  {t("admin.users.detail.saveStatus")}
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border"
                checked={user.is_test_account}
                disabled={busy}
                onChange={(event) =>
                  runAction(
                    () => toggleAdminUserTestAccount(user.id, event.target.checked),
                    t("admin.users.detail.testAccountUpdated"),
                  )
                }
              />
              {t("admin.users.detail.markTestAccount")}
            </label>
          </CardContent>
        </Card>

        <Card className="mt-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.privacy.consentsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {consents.length === 0 ? (
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
                  {consents.map((consent) => (
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
          </CardContent>
        </Card>

        <Card className="mt-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.users.detail.auditLogTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {admin_action_logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.users.detail.noAuditLogs")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.users.detail.auditAction")}</TableHead>
                    <TableHead>{t("admin.users.detail.auditAdmin")}</TableHead>
                    <TableHead>{t("admin.users.detail.auditTime")}</TableHead>
                    <TableHead>{t("admin.users.detail.auditNotes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admin_action_logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action_type}</TableCell>
                      <TableCell>{log.admin_email ?? log.admin_id}</TableCell>
                      <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                      <TableCell>{log.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
