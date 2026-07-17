"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { Clock, Trash2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-client"
import {
  createReminder,
  deleteReminder,
  getMyReminders,
  markReminderTaken,
  snoozeReminder,
} from "@/services/reminder"
import type { MedicationSupplementReminder } from "@/types/medication-reminder"

const schema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  reminderType: z.string().min(1, "Type is required"),
  scheduledTime: z.string().min(1, "Time is required"),
  dosage: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ReminderListView() {
  const [reminders, setReminders] = React.useState<MedicationSupplementReminder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reminderType: "medication" },
  })

  async function loadData() {
    try {
      const data = await getMyReminders()
      setReminders(data.reminders)
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
      await createReminder({
        item_name: values.itemName,
        reminder_type: values.reminderType,
        scheduled_time: values.scheduledTime,
        dosage: values.dosage || null,
      })
      toast.success("Reminder created")
      reset({ reminderType: "medication" })
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleMarkTaken(id: number) {
    try {
      await markReminderTaken(id)
      toast.success("Marked as taken")
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleSnooze(id: number) {
    try {
      await snoozeReminder(id, 15)
      toast.success("Reminder snoozed for 15 minutes")
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteReminder(deleteId)
      toast.success("Reminder deleted")
      setDeleteId(null)
      await loadData()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Medication & Supplement Reminders"
        description="Set schedules and track adherence"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add reminder</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Item name</Label>
              <Input {...register("itemName")} />
              {errors.itemName ? (
                <p className="text-sm text-destructive">{errors.itemName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select {...register("reminderType")}>
                <option value="medication">Medication</option>
                <option value="supplement">Supplement</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled time</Label>
              <Input type="time" {...register("scheduledTime")} />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input placeholder="e.g. 1 tablet" {...register("dosage")} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                Add
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{reminder.item_name}</CardTitle>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="size-3.5" />
                    {reminder.scheduled_time?.slice(0, 5)} · {reminder.reminder_type}
                  </p>
                </div>
                <Badge
                  variant={
                    reminder.adherence_status === "taken" ? "default" : "secondary"
                  }
                >
                  {reminder.adherence_status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {reminder.dosage ? (
                  <span className="text-sm text-muted-foreground">{reminder.dosage}</span>
                ) : null}
                <Button size="sm" onClick={() => handleMarkTaken(reminder.id)}>
                  Mark taken
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSnooze(reminder.id)}
                >
                  Snooze
                </Button>
                <Dialog
                  open={deleteId === reminder.id}
                  onOpenChange={(open) => setDeleteId(open ? reminder.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete reminder?</DialogTitle>
                      <DialogDescription>
                        This will permanently remove the reminder for {reminder.item_name}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteId(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
