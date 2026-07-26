export interface PCOSPattern {
  pattern: string
  description: string
  triggered_logs: {
    cycles?: Record<string, unknown>[]
    symptoms?: Record<string, unknown>[]
  }
}

export interface PCOSPatternsResponse {
  patterns: PCOSPattern[]
  disclaimer: string
  analyzed_at: string
}
