"use client"

import * as React from "react"
import { toast } from "sonner"

import { FadeIn } from "@/components/motion-card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { useLanguage } from "@/providers/language-provider"

export function AdminUsersView() {
  const { t, locale } = useLanguage()
  const [search, setSearch] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)

  const { data, isLoading, isError, error } = useAdminUsers(page, query)

  React.useEffect(() => {
    if (isError) toast.error(getLocalizedApiError(error, t))
  }, [isError, error, t])

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function formatDate(value: string | null) {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const users = data?.users ?? []
  const pages = data?.pagination.pages ?? 1
  const total = data?.pagination.total ?? 0

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
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.users.columns.name")}</TableHead>
                    <TableHead>{t("admin.users.columns.email")}</TableHead>
                    <TableHead>{t("admin.users.columns.language")}</TableHead>
                    <TableHead>{t("admin.users.columns.country")}</TableHead>
                    <TableHead>{t("admin.users.columns.onboarding")}</TableHead>
                    <TableHead>{t("admin.users.columns.registered")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
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
                      <TableCell>{formatDate(user.registration_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
                    onClick={() => setPage((current) => current - 1)}
                  >
                    {t("admin.users.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage((current) => current + 1)}
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
