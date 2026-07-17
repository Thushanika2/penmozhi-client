export interface PCOSDisorderStatus {
  id: number
  health_profile_id: number
  disorder_type: string
  diagnosis_status: string
  diagnosed_date: string | null
  created_at: string | null
}

export interface PCOSStatusHistory {
  pcos_status: PCOSDisorderStatus
  related_symptoms: import("./symptom-tracking-log").SymptomTrackingLog[]
}
