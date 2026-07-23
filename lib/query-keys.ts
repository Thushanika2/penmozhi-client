export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  insights: {
    health: (months: number) => ["insights", "health", months] as const,
  },
  admin: {
    analytics: (days: number) => ["admin", "analytics", days] as const,
    users: (page: number, search: string) => ["admin", "users", page, search] as const,
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
}
