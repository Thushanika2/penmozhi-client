import apiClient from "@/lib/api-client"
import type { MedicationSupplementReminder } from "@/types/medication-reminder"

export interface CreateReminderPayload {
  item_name: string
  reminder_type: string
  scheduled_time: string
  dosage?: string | null
}

export interface UpdateReminderPayload {
  item_name?: string
  reminder_type?: string
  scheduled_time?: string
  dosage?: string | null
  adherence_status?: string
}

export async function createReminder(payload: CreateReminderPayload) {
  const { data } = await apiClient.post<{
    message: string
    reminder: MedicationSupplementReminder
  }>("/api/reminders", payload)
  return data
}

export async function getMyReminders() {
  const { data } = await apiClient.get<{ reminders: MedicationSupplementReminder[] }>(
    "/api/reminders/my",
  )
  return data
}

export async function updateReminder(id: number, payload: UpdateReminderPayload) {
  const { data } = await apiClient.put<{
    message: string
    reminder: MedicationSupplementReminder
  }>(`/api/reminders/${id}`, payload)
  return data
}

export async function markReminderTaken(id: number) {
  const { data } = await apiClient.post<{
    message: string
    reminder: MedicationSupplementReminder
  }>(`/api/reminders/${id}/mark-taken`)
  return data
}

export async function snoozeReminder(id: number, minutes = 15) {
  const { data } = await apiClient.post<{
    message: string
    reminder: MedicationSupplementReminder
  }>(`/api/reminders/${id}/snooze`, { minutes })
  return data
}

export async function deleteReminder(id: number) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/api/reminders/${id}`,
  )
  return data
}
