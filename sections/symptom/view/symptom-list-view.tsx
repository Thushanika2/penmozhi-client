"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

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
  createSymptom,
  getMySymptoms,
  getSymptomTrends,
} from "@/services/symptom"
import type { SymptomTrackingLog, SymptomTrends } from "@/types/symptom-tracking-log"

const schema = z.object({
  category: z.string().min(1, "Category is required"),
  painSeverity: z.number().min(0).max(10),
  moodStatus: z.string().optional(),
  sleepMetrics: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function SymptomListView() {
  const [symptoms, setSymptoms] = React.useState<SymptomTrackingLog[]>([])
  const [trends, setTrends] = React.useState<SymptomTrends | null>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { painSeverity: 3 },
  })

  async function loadData() {
    try {
      const [symptomsData, trendsData] = await Promise.all([
        getMySymptoms(),
        getSymptomTrends(),
      ])
      setSymptoms(symptomsData.symptoms)
      setTrends(trendsData)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      const result = await createSymptom({
        category: values.category,
        pain_severity: values.painSeverity,
        mood_status: values.moodStatus || null,
        sleep_metrics: values.sleepMetrics || null,
      })
      toast.success("Symptom logged")
      if (result.ai_flag) {
        toast.info(result.ai_flag)
      }
      reset({ painSeverity: 3 })
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Symptom Tracking"
        description="Monitor pain, mood, and sleep patterns over time"
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pain trend by date</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {trends?.date_trends.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.date_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg_pain" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No trend data yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Symptoms by category</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {trends?.category_trends.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.category_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No category data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log symptom</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="e.g. cramps" {...register("category")} />
              {errors.category ? (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Pain severity (0-10)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                {...register("painSeverity", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mood</Label>
              <Input placeholder="e.g. anxious" {...register("moodStatus")} />
            </div>
            <div className="space-y-2">
              <Label>Sleep</Label>
              <Input placeholder="e.g. 6 hours" {...register("sleepMetrics")} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Log symptom"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries ({trends?.total_entries ?? 0} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pain</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Sleep</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symptoms.map((symptom) => (
                  <TableRow key={symptom.id}>
                    <TableCell>{symptom.date_time?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{symptom.category}</Badge>
                    </TableCell>
                    <TableCell>{symptom.pain_severity}/10</TableCell>
                    <TableCell>{symptom.mood_status ?? "—"}</TableCell>
                    <TableCell>{symptom.sleep_metrics ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
