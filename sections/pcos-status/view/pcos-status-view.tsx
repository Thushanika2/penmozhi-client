"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  getMyPCOSStatuses,
  getPCOSStatusHistory,
  updatePCOSStatus,
} from "@/services/pcos-status"
import { useLanguage } from "@/providers/language-provider"
import type { PCOSDisorderStatus } from "@/types/pcos-status"

type FormValues = {
  disorderType: string
  diagnosisStatus: string
  diagnosedDate?: string
}

export function PCOSStatusView() {
  const { t } = useLanguage()
  const [statuses, setStatuses] = React.useState<PCOSDisorderStatus[]>([])
  const [history, setHistory] = React.useState<PCOSDisorderStatus[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const schema = React.useMemo(
    () =>
      z.object({
        disorderType: z.string().min(1, t("pcosStatus.validation.disorderTypeRequired")),
        diagnosisStatus: z.string().min(1, t("pcosStatus.validation.diagnosisStatusRequired")),
        diagnosedDate: z.string().optional(),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function loadData() {
    try {
      const data = await getMyPCOSStatuses()
      setStatuses(data.pcos_statuses)
      if (data.pcos_statuses.length && !selectedId) {
        setSelectedId(data.pcos_statuses[0].id)
      }
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMyPCOSStatuses()
        if (cancelled) return
        setStatuses(data.pcos_statuses)
        if (data.pcos_statuses.length) {
          setSelectedId((current) => current ?? data.pcos_statuses[0].id)
        }
      } catch (error) {
        if (!cancelled) toast.error(getLocalizedApiError(error, t))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [t])

  React.useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    async function loadHistory() {
      try {
        const data = await getPCOSStatusHistory(selectedId!)
        if (cancelled) return
        reset({
          disorderType: data.pcos_status.disorder_type,
          diagnosisStatus: data.pcos_status.diagnosis_status,
          diagnosedDate: data.pcos_status.diagnosed_date ?? "",
        })
        setHistory(data.history ?? [])
      } catch (error) {
        if (!cancelled) toast.error(getLocalizedApiError(error, t))
      }
    }
    void loadHistory()
    return () => {
      cancelled = true
    }
  }, [selectedId, reset, t])

  async function onSubmit(values: FormValues) {
    if (!selectedId) return
    try {
      await updatePCOSStatus(selectedId, {
        disorder_type: values.disorderType,
        diagnosis_status: values.diagnosisStatus,
        diagnosed_date: values.diagnosedDate || null,
      })
      toast.success(t("pcosStatus.toast.updated"))
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  const current = statuses.find((s) => s.id === selectedId)

  return (
    <div>
      <PageHeader
        title={t("pcosStatus.title")}
        description={t("pcosStatus.description")}
      />

      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("pcosStatus.currentStatus.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {current ? (
                <div className="mb-4 space-y-2">
                  <Badge>{current.disorder_type}</Badge>
                  <p className="text-sm">
                    {t("pcosStatus.currentStatus.diagnosisLabel")}:{" "}
                    <strong>{current.diagnosis_status}</strong>
                  </p>
                  {current.diagnosed_date ? (
                    <p className="text-sm text-muted-foreground">
                      {t("pcosStatus.currentStatus.diagnosedLabel")}: {current.diagnosed_date}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("pcosStatus.form.disorderType")}</Label>
                  <Select {...register("disorderType")}>
                    <option value="none">{t("pcosStatus.options.disorder.none")}</option>
                    <option value="pcos">{t("pcosStatus.options.disorder.pcos")}</option>
                    <option value="endometriosis">{t("pcosStatus.options.disorder.endometriosis")}</option>
                    <option value="other">{t("pcosStatus.options.disorder.other")}</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("pcosStatus.form.diagnosisStatus")}</Label>
                  <Select {...register("diagnosisStatus")}>
                    <option value="not_diagnosed">{t("pcosStatus.options.diagnosis.notDiagnosed")}</option>
                    <option value="suspected">{t("pcosStatus.options.diagnosis.suspected")}</option>
                    <option value="diagnosed">{t("pcosStatus.options.diagnosis.diagnosed")}</option>
                    <option value="monitoring">{t("pcosStatus.options.diagnosis.monitoring")}</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("pcosStatus.form.diagnosedDate")}</Label>
                  <Input type="date" {...register("diagnosedDate")} />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("common.saving") : t("pcosStatus.form.updateStatus")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("pcosStatus.history.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("pcosStatus.history.recorded")}</TableHead>
                    <TableHead>{t("pcosStatus.history.disorder")}</TableHead>
                    <TableHead>{t("pcosStatus.history.diagnosis")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.created_at?.slice(0, 10)}</TableCell>
                      <TableCell>{entry.disorder_type}</TableCell>
                      <TableCell>{entry.diagnosis_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!history.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("pcosStatus.history.empty")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
