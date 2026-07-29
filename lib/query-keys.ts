export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  insights: {
    health: (months: number) => ["insights", "health", months] as const,
  },
  admin: {
    analytics: (days: number) => ["admin", "analytics", days] as const,
    users: (filters: import("@/types/admin").AdminUsersFilters) =>
      ["admin", "users", filters] as const,
    userDetail: (userId: number) => ["admin", "users", "detail", userId] as const,
    testCandidates: () => ["admin", "users", "test-candidates"] as const,
    privacyRequests: (status: string) => ["admin", "privacy", "requests", status] as const,
    privacyIntegrations: () => ["admin", "privacy", "integrations"] as const,
    userConsents: (userId: number) => ["admin", "privacy", "consents", userId] as const,
  },
  symptoms: {
    list: ["symptoms", "list"] as const,
    trends: ["symptoms", "trends"] as const,
  },
  cycles: {
    list: ["cycles", "list"] as const,
    prediction: ["cycles", "prediction"] as const,
    calendar: (year: number, month: number) => ["cycles", "calendar", year, month] as const,
  },
  dailyLogs: {
    list: ["daily-logs", "list"] as const,
  },
  profile: {
    risks: (healthProfileId: number) => ["profile", "risks", healthProfileId] as const,
  },
  trackingCategories: {
    list: (group?: string) => ["tracking-categories", group ?? "all"] as const,
  },
  customTags: {
    list: ["custom-tags", "list"] as const,
  },
  pregnancy: {
    profile: ["pregnancy", "profile"] as const,
  },
  perimenopause: {
    list: ["perimenopause", "list"] as const,
  },
  conceive: {
    insights: ["conceive", "insights"] as const,
  },
  cycleShares: {
    list: ["cycle-shares", "list"] as const,
    view: (id: number) => ["cycle-shares", "view", id] as const,
  },
  wearables: {
    list: ["wearables", "list"] as const,
  },
  subscription: {
    my: ["subscription", "my"] as const,
  },
  pcosPatterns: {
    list: ["pcos-patterns", "list"] as const,
  },
}
