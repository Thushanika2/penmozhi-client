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
import { getApiErrorMessage } from "@/lib/api-client"
import {
  getMyPCOSStatuses,
  getPCOSStatusHistory,
  updatePCOSStatus,
} from "@/services/pcos-status"
import type { PCOSDisorderStatus } from "@/types/pcos-status"
import type { SymptomTrackingLog } from "@/types/symptom-tracking-log"

const schema = z.object({
  disorderType: z.string().min(1),
  diagnosisStatus: z.string().min(1),
  diagnosedDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function PCOSStatusView() {
  const [statuses, setStatuses] = React.useState<PCOSDisorderStatus[]>([])
  const [relatedSymptoms, setRelatedSymptoms] = React.useState<SymptomTrackingLog[]>(
    [],
  )
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>()

  async function loadData() {
    try {
      const data = await getMyPCOSStatuses()
      setStatuses(data.pcos_statuses)
      if (data.pcos_statuses.length && !selectedId) {
        setSelectedId(data.pcos_statuses[0].id)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    if (!selectedId) return
    async function loadHistory() {
      try {
        const data = await getPCOSStatusHistory(selectedId!)
        reset({
          disorderType: data.pcos_status.disorder_type,
          diagnosisStatus: data.pcos_status.diagnosis_status,
          diagnosedDate: data.pcos_status.diagnosed_date ?? "",
        })
        setRelatedSymptoms(data.related_symptoms)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }
    loadHistory()
  }, [selectedId, reset])

  async function onSubmit(values: FormValues) {
    if (!selectedId) return
    try {
      await updatePCOSStatus(selectedId, {
        disorder_type: values.disorderType,
        diagnosis_status: values.diagnosisStatus,
        diagnosed_date: values.diagnosedDate || null,
      })
      toast.success("PCOS status updated")
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const current = statuses.find((s) => s.id === selectedId)

  return (
    <div>
      <PageHeader
        title="PCOS Disorder Status"
        description="View and update your diagnosis status and related symptom history"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current status</CardTitle>
            </CardHeader>
            <CardContent>
              {current ? (
                <div className="mb-4 space-y-2">
                  <Badge>{current.disorder_type}</Badge>
                  <p className="text-sm">
                    Diagnosis: <strong>{current.diagnosis_status}</strong>
                  </p>
                  {current.diagnosed_date ? (
                    <p className="text-sm text-muted-foreground">
                      Diagnosed: {current.diagnosed_date}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Disorder type</Label>
                  <Select {...register("disorderType")}>
                    <option value="none">None</option>
                    <option value="pcos">PCOS</option>
                    <option value="endometriosis">Endometriosis</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis status</Label>
                  <Select {...register("diagnosisStatus")}>
                    <option value="not_diagnosed">Not diagnosed</option>
                    <option value="suspected">Suspected</option>
                    <option value="diagnosed">Diagnosed</option>
                    <option value="monitoring">Monitoring</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosed date</Label>
                  <Input type="date" {...register("diagnosedDate")} />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Pain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedSymptoms.map((symptom) => (
                    <TableRow key={symptom.id}>
                      <TableCell>{symptom.date_time?.slice(0, 10)}</TableCell>
                      <TableCell>{symptom.category}</TableCell>
                      <TableCell>{symptom.pain_severity}/10</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!relatedSymptoms.length ? (
                <p className="text-sm text-muted-foreground">
                  No linked symptoms yet
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
