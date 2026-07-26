import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import { getDashboardSummary } from "@/services/dashboard"
import { getHealthInsights } from "@/services/insights"
import { getAdminAnalytics, getAdminUsers } from "@/services/admin"
import { getMySymptoms, getSymptomTrends } from "@/services/symptom"
import { getTrackingCategories } from "@/services/tracking-category"
import { getMyCustomTags } from "@/services/custom-tag"
import { getPregnancyProfile } from "@/services/pregnancy-profile"
import { getMyPerimenopauseLogs } from "@/services/perimenopause-log"
import { getConceiveInsights } from "@/services/conceive"
import { getCycleShares, viewCycleShare } from "@/services/cycle-share"
import { getMyWearables } from "@/services/wearable"
import { getMySubscription } from "@/services/subscription"
import { getPCOSPatterns } from "@/services/pcos-patterns"

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

export function useTrackingCategories(group?: string) {
  return useQuery({
    queryKey: queryKeys.trackingCategories.list(group),
    queryFn: () => getTrackingCategories(group),
  })
}

export function useCustomTags() {
  return useQuery({
    queryKey: queryKeys.customTags.list,
    queryFn: getMyCustomTags,
  })
}

export function usePregnancyProfile() {
  return useQuery({
    queryKey: queryKeys.pregnancy.profile,
    queryFn: getPregnancyProfile,
  })
}

export function usePerimenopauseLogs() {
  return useQuery({
    queryKey: queryKeys.perimenopause.list,
    queryFn: () => getMyPerimenopauseLogs(),
  })
}

export function useConceiveInsights() {
  return useQuery({
    queryKey: queryKeys.conceive.insights,
    queryFn: getConceiveInsights,
  })
}

export function useCycleShares() {
  return useQuery({
    queryKey: queryKeys.cycleShares.list,
    queryFn: getCycleShares,
  })
}

export function useCycleShareView(shareId: number) {
  return useQuery({
    queryKey: queryKeys.cycleShares.view(shareId),
    queryFn: () => viewCycleShare(shareId),
    enabled: shareId > 0,
  })
}

export function useWearables() {
  return useQuery({
    queryKey: queryKeys.wearables.list,
    queryFn: getMyWearables,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription.my,
    queryFn: getMySubscription,
  })
}

export function usePCOSPatterns() {
  return useQuery({
    queryKey: queryKeys.pcosPatterns.list,
    queryFn: getPCOSPatterns,
  })
}
