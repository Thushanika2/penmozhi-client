import { getApiErrorMessage, getApiErrorPayload } from "@/lib/api-client"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function getLocalizedApiError(error: unknown, t: Translate): string {
  const fromKey = (code: string) => {
    const key = `api.errors.${code}`
    const translated = t(key)
    return translated === key ? null : translated
  }

  const payload = getApiErrorPayload(error)
  if (payload?.errors?.length) {
    const first = payload.errors[0]
    if (typeof first === "object" && first?.code) {
      return fromKey(first.code) ?? first.message ?? first.code
    }
  }

  if (payload?.error_code) {
    return fromKey(payload.error_code) ?? payload.error ?? payload.error_code
  }

  if (payload?.error) return payload.error
  if (payload?.message) return payload.message

  const fallback = getApiErrorMessage(error)
  if (fallback.includes("Cannot reach the Penmozhi API")) {
    return t("api.errors.network")
  }

  return fallback || t("api.errors.unexpected")
}
