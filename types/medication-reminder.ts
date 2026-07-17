export interface MedicationSupplementReminder {
  id: number
  profile_id: number
  item_name: string
  reminder_type: string
  scheduled_time: string
  dosage: string | null
  adherence_status: string
  created_at: string | null
}
