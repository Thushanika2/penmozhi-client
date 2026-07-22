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
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import {
  createReminder,
  deleteReminder,
  getMyReminders,
  markReminderTaken,
  snoozeReminder,
} from "@/services/reminder"
import type { MedicationSupplementReminder } from "@/types/medication-reminder"

const TYPE_LABEL_KEYS: Record<string, string> = {
  medication: "reminders.type.medication",
  supplement: "reminders.type.supplement",
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  pending: "reminders.status.pending",
  taken: "reminders.status.taken",
  snoozed: "reminders.status.snoozed",
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    itemName: z.string().min(1, t("reminders.validation.itemNameRequired")),
    reminderType: z.string().min(1, t("reminders.validation.typeRequired")),
    scheduledTime: z.string().min(1, t("reminders.validation.timeRequired")),
    dosage: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function ReminderListView() {
  const { t } = useLanguage()
  const [reminders, setReminders] = React.useState<MedicationSupplementReminder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const schema = React.useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reminderType: "medication" },
  })

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMyReminders()
        if (cancelled) return
        setReminders(data.reminders)
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

  async function loadData() {
    try {
      const data = await getMyReminders()
      setReminders(data.reminders)
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await createReminder({
        item_name: values.itemName,
        reminder_type: values.reminderType,
        scheduled_time: values.scheduledTime,
        dosage: values.dosage || null,
      })
      toast.success(t("reminders.toast.created"))
      reset({ reminderType: "medication" })
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function handleMarkTaken(id: number) {
    try {
      await markReminderTaken(id)
      toast.success(t("reminders.toast.markedTaken"))
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function handleSnooze(id: number) {
    try {
      await snoozeReminder(id, 15)
      toast.success(t("reminders.toast.snoozed"))
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteReminder(deleteId)
      toast.success(t("reminders.toast.deleted"))
      setDeleteId(null)
      await loadData()
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  function typeLabel(value: string) {
    const key = TYPE_LABEL_KEYS[value]
    return key ? t(key) : value
  }

  function statusLabel(value: string) {
    const key = STATUS_LABEL_KEYS[value]
    return key ? t(key) : value
  }

  return (
    <div>
      <PageHeader
        title={t("reminders.title")}
        description={t("reminders.description")}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("reminders.form.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>{t("reminders.form.itemName")}</Label>
              <Input {...register("itemName")} />
              {errors.itemName ? (
                <p className="text-sm text-destructive">{errors.itemName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("reminders.form.type")}</Label>
              <Select {...register("reminderType")}>
                <option value="medication">{t("reminders.type.medication")}</option>
                <option value="supplement">{t("reminders.type.supplement")}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("reminders.form.scheduledTime")}</Label>
              <Input type="time" {...register("scheduledTime")} />
            </div>
            <div className="space-y-2">
              <Label>{t("reminders.form.dosage")}</Label>
              <Input
                placeholder={t("reminders.form.dosagePlaceholder")}
                {...register("dosage")}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {t("reminders.form.submit")}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{reminder.item_name}</CardTitle>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="size-3.5" />
                    {reminder.scheduled_time?.slice(0, 5)} ·{" "}
                    {typeLabel(reminder.reminder_type)}
                  </p>
                </div>
                <Badge
                  variant={
                    reminder.adherence_status === "taken" ? "default" : "secondary"
                  }
                >
                  {statusLabel(reminder.adherence_status)}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {reminder.dosage ? (
                  <span className="text-sm text-muted-foreground">{reminder.dosage}</span>
                ) : null}
                <Button size="sm" onClick={() => handleMarkTaken(reminder.id)}>
                  {t("reminders.actions.markTaken")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSnooze(reminder.id)}
                >
                  {t("reminders.actions.snooze")}
                </Button>
                <Dialog
                  open={deleteId === reminder.id}
                  onOpenChange={(open) => setDeleteId(open ? reminder.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="size-4" />
                      {t("reminders.actions.delete")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("reminders.deleteDialog.title")}</DialogTitle>
                      <DialogDescription>
                        {t("reminders.deleteDialog.description", {
                          name: reminder.item_name,
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteId(null)}>
                        {t("reminders.deleteDialog.cancel")}
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        {t("reminders.deleteDialog.confirm")}
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
