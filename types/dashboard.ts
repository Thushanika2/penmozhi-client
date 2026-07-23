import type { CycleInsights } from "@/types/cycle-history-log"
import type { MedicationSupplementReminder } from "@/types/medication-reminder"
import type { SymptomTrackingLog } from "@/types/symptom-tracking-log"

export interface DashboardSummary {
  cycle_insights: CycleInsights
  today_symptoms: SymptomTrackingLog[]
  upcoming_reminders: MedicationSupplementReminder[]
  health_tip_key: string
  water_intake_goal_liters: number
  quick_actions: Array<{ href: string; label_key: string }>
}
