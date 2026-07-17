"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import {
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
  CardDescription,
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
import { createCycle, getMyCycles, predictNextPeriod } from "@/services/cycle"
import type { CycleHistoryLog, CyclePrediction } from "@/types/cycle-history-log"

const schema = z.object({
  cycleStartDate: z.string().min(1, "Start date is required"),
  cycleEndDate: z.string().min(1, "End date is required"),
  flowIntensity: z.string().min(1, "Flow intensity is required"),
})

type FormValues = z.infer<typeof schema>

export function CycleListView() {
  const [cycles, setCycles] = React.useState<CycleHistoryLog[]>([])
  const [prediction, setPrediction] = React.useState<CyclePrediction | null>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { flowIntensity: "medium" },
  })

  async function loadData() {
    try {
      const [cyclesData, predictionData] = await Promise.all([
        getMyCycles(),
        predictNextPeriod(),
      ])
      setCycles(cyclesData.cycles)
      setPrediction(predictionData)
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
      await createCycle({
        cycle_start_date: values.cycleStartDate,
        cycle_end_date: values.cycleEndDate,
        flow_intensity: values.flowIntensity,
      })
      toast.success("Cycle logged successfully")
      reset({ flowIntensity: "medium" })
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const chartData = cycles
    .slice()
    .reverse()
    .map((cycle) => ({
      name: cycle.cycle_start_date,
      days:
        (new Date(cycle.cycle_end_date).getTime() -
          new Date(cycle.cycle_start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    }))

  return (
    <div>
      <PageHeader
        title="Cycle Tracking"
        description="Log your menstrual cycles and view next-period predictions"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next period prediction</CardTitle>
            <CardDescription>
              {prediction?.message ?? "Based on your cycle history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {prediction?.predicted_next_period_date ?? "—"}
            </p>
            {prediction?.based_on_cycles ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {prediction.based_on_cycles} logged cycle(s)
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cycle length trend</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                Log cycles to see trends
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log new cycle</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" {...register("cycleStartDate")} />
              {errors.cycleStartDate ? (
                <p className="text-sm text-destructive">
                  {errors.cycleStartDate.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" {...register("cycleEndDate")} />
              {errors.cycleEndDate ? (
                <p className="text-sm text-destructive">
                  {errors.cycleEndDate.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Flow intensity</Label>
              <Select {...register("flowIntensity")}>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add cycle"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cycle history</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Predicted next</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>{cycle.cycle_start_date}</TableCell>
                    <TableCell>{cycle.cycle_end_date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cycle.flow_intensity}</Badge>
                    </TableCell>
                    <TableCell>
                      {cycle.predicted_next_period_date ?? "—"}
                    </TableCell>
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
