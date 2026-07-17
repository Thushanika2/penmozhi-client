export interface HealthProfile {
  id: number
  profile_id: number
  weight: number | null
  height: number | null
  calculated_bmi: number | null
  nutritional_needs: string | null
  health_risks: string | null
  created_at: string | null
}

export interface HealthProfileRisks {
  health_risks: string | null
  calculated_bmi: number | null
  bmi_category: string | null
  nutritional_needs: string | null
}
