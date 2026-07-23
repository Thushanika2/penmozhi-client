import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { getDashboardSummary } from "@/services/dashboard"
import { getHealthInsights } from "@/services/insights"
import { getAdminAnalytics, getAdminUsers } from "@/services/admin"
import { getMySymptoms, getSymptomTrends } from "@/services/symptom"

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: getDashboardSummary,
  })
}

export function useHealthInsights(months: number) {
  return useQuery({
    queryKey: queryKeys.insights.health(months),
    queryFn: () => getHealthInsights(months),
  })
}

export function useAdminAnalytics(days = 30) {
  return useQuery({
    queryKey: queryKeys.admin.analytics(days),
    queryFn: () => getAdminAnalytics(days),
  })
}

export function useAdminUsers(page: number, search: string) {
  return useQuery({
    queryKey: queryKeys.admin.users(page, search),
    queryFn: () => getAdminUsers(page, search),
  })
}

export function useSymptomsData() {
  return useQuery({
    queryKey: queryKeys.symptoms.list,
    queryFn: async () => {
      const [symptomsData, trendsData] = await Promise.all([
        getMySymptoms(),
        getSymptomTrends(),
      ])
      return {
        symptoms: symptomsData.symptoms,
        trends: trendsData,
      }
    },
  })
}
