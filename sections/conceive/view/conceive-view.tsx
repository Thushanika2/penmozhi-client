"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useConceiveInsights } from "@/hooks/use-queries"
import { useLanguage } from "@/providers/language-provider"

export function ConceiveView() {
  const { t } = useLanguage()
  const { data, isLoading } = useConceiveInsights()

  return (
    <div>
      <PageHeader title={t("conceive.title")} description={t("conceive.description")} />
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : !data?.has_data ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("conceive.noData")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("conceive.fertileWindow")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                {data.fertile_window_start} — {data.fertile_window_end}
              </p>
              <Badge variant="secondary">{t("conceive.basedOnCycles")}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("conceive.ovulation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{data.ovulation_date}</p>
              <p className="text-sm text-muted-foreground">
                {t("conceive.nextPeriod")}: {data.next_period_date}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
