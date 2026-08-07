"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FadeIn } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useAdminUsers } from "@/hooks/use-queries"
import {
  downloadAdminBulkUserExport,
  forceAdminUserLogout,
  requestAdminUserDelete,
  toggleAdminUserSuspend,
} from "@/services/admin"
import type { AdminUsersFilters } from "@/types/admin"
import type { SubscriptionLabel, UserProfile, UserStatus } from "@/types/user-profile"
import { Ban, Eye, LogOut, Trash2 } from "lucide-react"
import { useLanguage } from "@/providers/language-provider"

function statusVariant(status: UserStatus): "default" | "secondary" | "destructive" {
  if (status === "active") return "default"
  if (status === "suspended") return "secondary"
  return "destructive"
}

function ActionIconButton({
  label,
  icon,
  variant = "outline",
  className,
  ...props
}: {
  label: string
  icon: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
} & React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      type="button"
      variant={variant}
      size="icon-lg"
      className={`rounded-full min-h-[36px] min-w-[36px] ${className ?? ""}`}
      title={label}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  )
}

function subscriptionVariant(label: SubscriptionLabel): "default" | "secondary" | "outline" | "destructive" {
  if (label === "premium") return "default"
  if (label === "trial") return "outline"
  if (label === "expired") return "destructive"
  return "secondary"
}

export function AdminUsersView() {
  const { t, locale } = useLanguage()
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<AdminUsersFilters["status"]>("all")
  const [subscriptionFilter, setSubscriptionFilter] =
    React.useState<AdminUsersFilters["subscription"]>("all")
  const [onboardingFilter, setOnboardingFilter] =
    React.useState<AdminUsersFilters["onboarding"]>("all")
  const [hideTestAccounts, setHideTestAccounts] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<number[]>([])
  const [actionUserId, setActionUserId] = React.useState<number | null>(null)

  const filters: AdminUsersFilters = {
    page,
    search: query,
    status: statusFilter,
    subscription: subscriptionFilter,
    onboarding: onboardingFilter,
    hideTestAccounts,
  }

  const { data, isLoading, isError, error } = useAdminUsers(filters)

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  function applyFilterChange<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) {
    setPage(1)
    setSelectedIds([])
    setter(value)
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
    setSelectedIds([])
  }

  function changePage(nextPage: number) {
    setPage(nextPage)
    setSelectedIds([])
  }

  function formatDate(value: string | null) {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function toggleSelected(userId: number, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, userId] : current.filter((id) => id !== userId),
    )
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([])
      return
    }
    setSelectedIds(users.map((user) => user.id))
  }

  async function invalidateUsers() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  }

  async function handleToggleSuspend(user: UserProfile) {
    setActionUserId(user.id)
    try {
      await toggleAdminUserSuspend(user.id)
      toast.success(
        user.status === "active"
          ? t("admin.users.actions.suspendSuccess")
          : t("admin.users.actions.unsuspendSuccess"),
      )
      await invalidateUsers()
    } catch (err) {
      toast.error(getLocalizedApiError(err, t))
    } finally {
      setActionUserId(null)
    }
  }

  async function handleForceLogout(userId: number) {
    setActionUserId(userId)
    try {
      await forceAdminUserLogout(userId)
      toast.success(t("admin.users.actions.forceLogoutSuccess"))
      await invalidateUsers()
    } catch (err) {
      toast.error(getLocalizedApiError(err, t))
    } finally {
      setActionUserId(null)
    }
  }

  async function handleRequestDelete(userId: number) {
    setActionUserId(userId)
    try {
      const result = await requestAdminUserDelete(userId)
      toast.success(t("admin.users.actions.deleteRequestSuccess"))
      window.location.href = result.redirect_path
    } catch (err) {
      toast.error(getLocalizedApiError(err, t))
    } finally {
      setActionUserId(null)
    }
  }

  async function handleBulkExport() {
    if (selectedIds.length === 0) return
    try {
      await downloadAdminBulkUserExport(selectedIds)
      toast.success(t("admin.users.bulk.exportSuccess"))
    } catch (err) {
      toast.error(getLocalizedApiError(err, t))
    }
  }

  const users = data?.users ?? []
  const pages = data?.pagination.pages ?? 1
  const total = data?.pagination.total ?? 0
  const allSelected = users.length > 0 && selectedIds.length === users.length

  return (
    <div>
      <FadeIn>
        <PageHeader
          title={t("admin.users.title")}
          description={t("admin.users.description", { count: String(total) })}
        />

        <Card className="mb-6 rounded-3xl">
          <CardHeader>
            <CardTitle>{t("admin.users.searchTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("admin.users.searchPlaceholder")}
              />
              <Button type="submit" className="rounded-full">
                {t("admin.users.search")}
              </Button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="status-filter">{t("admin.users.filters.status")}</Label>
                <Select
                  id="status-filter"
                  value={statusFilter ?? "all"}
                  onChange={(event) => {
                    applyFilterChange(setStatusFilter, event.target.value as AdminUsersFilters["status"])
                  }}
                >
                  <option value="all">{t("admin.users.filters.all")}</option>
                  <option value="active">{t("admin.users.status.active")}</option>
                  <option value="suspended">{t("admin.users.status.suspended")}</option>
                  <option value="banned">{t("admin.users.status.banned")}</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="subscription-filter">{t("admin.users.filters.subscription")}</Label>
                <Select
                  id="subscription-filter"
                  value={subscriptionFilter ?? "all"}
                  onChange={(event) => {
                    applyFilterChange(
                      setSubscriptionFilter,
                      event.target.value as AdminUsersFilters["subscription"],
                    )
                  }}
                >
                  <option value="all">{t("admin.users.filters.all")}</option>
                  <option value="free">{t("admin.users.subscription.free")}</option>
                  <option value="premium">{t("admin.users.subscription.premium")}</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="onboarding-filter">{t("admin.users.filters.onboarding")}</Label>
                <Select
                  id="onboarding-filter"
                  value={onboardingFilter ?? "all"}
                  onChange={(event) => {
                    applyFilterChange(
                      setOnboardingFilter,
                      event.target.value as AdminUsersFilters["onboarding"],
                    )
                  }}
                >
                  <option value="all">{t("admin.users.filters.all")}</option>
                  <option value="complete">{t("admin.users.onboardingComplete")}</option>
                  <option value="pending">{t("admin.users.onboardingPending")}</option>
                </Select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border"
                    checked={hideTestAccounts}
                    onChange={(event) => {
                      applyFilterChange(setHideTestAccounts, event.target.checked)
                    }}
                  />
                  {t("admin.users.filters.hideTestAccounts")}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedIds.length > 0 && (
          <Card className="mb-4 rounded-3xl border-primary/30">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <p className="text-sm font-medium">
                {t("admin.users.bulk.selected", { count: String(selectedIds.length) })}
              </p>
              <Button size="sm" className="rounded-full" onClick={handleBulkExport}>
                {t("admin.users.bulk.exportCsv")}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl">
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            className="size-4 rounded border"
                            checked={allSelected}
                            onChange={(event) => toggleSelectAll(event.target.checked)}
                            aria-label={t("admin.users.bulk.selectAll")}
                          />
                        </TableHead>
                        <TableHead>{t("admin.users.columns.name")}</TableHead>
                        <TableHead>{t("admin.users.columns.email")}</TableHead>
                        <TableHead>{t("admin.users.columns.status")}</TableHead>
                        <TableHead>{t("admin.users.columns.subscription")}</TableHead>
                        <TableHead>{t("admin.users.columns.language")}</TableHead>
                        <TableHead>{t("admin.users.columns.country")}</TableHead>
                        <TableHead>{t("admin.users.columns.onboarding")}</TableHead>
                        <TableHead>{t("admin.users.columns.lastActive")}</TableHead>
                        <TableHead>{t("admin.users.columns.registered")}</TableHead>
                        <TableHead>{t("admin.users.columns.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const subscription = user.subscription ?? "free"
                        const busy = actionUserId === user.id
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="size-4 rounded border"
                                checked={selectedIds.includes(user.id)}
                                onChange={(event) => toggleSelected(user.id, event.target.checked)}
                                aria-label={t("admin.users.bulk.selectUser", {
                                  name: user.full_name,
                                })}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {user.full_name}
                              {user.is_test_account && (
                                <Badge variant="outline" className="ml-2">
                                  {t("admin.users.testAccount")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(user.status ?? "active")}>
                                {t(`admin.users.status.${user.status ?? "active"}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={subscriptionVariant(subscription)}>
                                {t(`admin.users.subscription.${subscription}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.language_preference === "tamil"
                                ? t("common.tamil")
                                : t("common.english")}
                            </TableCell>
                            <TableCell>{user.country ?? "—"}</TableCell>
                            <TableCell>
                              <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                                {user.onboarding_completed
                                  ? t("admin.users.onboardingComplete")
                                  : t("admin.users.onboardingPending")}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.last_active_at ?? null)}</TableCell>
                            <TableCell>{formatDate(user.registration_date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ActionIconButton
                                  variant="outline"
                                  render={<Link href={`/admin/users/${user.id}`} />}
                                  icon={<Eye className="size-4" />}
                                  label={t("admin.users.actions.view")}
                                />
                                {user.status !== "banned" && (
                                  <ActionIconButton
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() => handleToggleSuspend(user)}
                                    icon={<Ban className="size-4" />}
                                    label={
                                      user.status === "active"
                                        ? t("admin.users.actions.suspend")
                                        : t("admin.users.actions.unsuspend")
                                    }
                                  />
                                )}
                                <ActionIconButton
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() => handleForceLogout(user.id)}
                                  icon={<LogOut className="size-4" />}
                                  label={t("admin.users.actions.forceLogout")}
                                />
                                <ActionIconButton
                                  variant="destructive"
                                  disabled={busy}
                                  onClick={() => handleRequestDelete(user.id)}
                                  icon={<Trash2 className="size-4" />}
                                  label={t("admin.users.actions.delete")}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.users.pageInfo", {
                      page: String(page),
                      pages: String(Math.max(pages, 1)),
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => changePage(page - 1)}
                    >
                      {t("admin.users.previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pages}
                      onClick={() => changePage(page + 1)}
                    >
                      {t("admin.users.next")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
