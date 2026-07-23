export const COUNTRIES = [
  "India",
  "Sri Lanka",
  "Singapore",
  "Malaysia",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Other",
] as const

export type CountryOption = (typeof COUNTRIES)[number]
