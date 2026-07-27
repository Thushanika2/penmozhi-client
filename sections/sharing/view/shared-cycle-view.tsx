"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCycleShareView } from "@/hooks/use-queries"
import { useLanguage } from "@/providers/language-provider"

export function SharedCycleView({ shareId }: { shareId: number }) {
  const { t } = useLanguage()
  const { data, isLoading, isError } = useCycleShareView(shareId)

  if (isLoading) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>
  }

  if (isError || !data) {
    return <p className="text-destructive">{t("sharing.viewError")}</p>
  }

  return (
    <div>
      <PageHeader
        title={t("sharing.sharedView.title")}
        description={t("sharing.sharedView.description", { name: data.owner_name })}
      />
      {data.cycles?.length ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("sharing.sharedView.cycles")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cycle.history.start")}</TableHead>
                  <TableHead>{t("cycle.history.end")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cycles.map((cycle, index) => (
                  <TableRow key={index}>
                    <TableCell>{String(cycle.cycle_start_date ?? "—")}</TableCell>
                    <TableCell>{String(cycle.cycle_end_date ?? "—")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
      {data.symptoms?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("sharing.sharedView.symptoms")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.symptoms.map((symptom, index) => (
                <li key={index} className="rounded border border-border p-2">
                  {String(symptom.category)} — {String(symptom.date_time ?? "").slice(0, 10)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
