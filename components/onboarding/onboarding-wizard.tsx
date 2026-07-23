"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { getPostAuthPath } from "@/lib/auth-redirect"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import * as onboardingService from "@/services/onboarding"
import { COUNTRIES } from "@/lib/countries"
import type { UserProfile } from "@/types/user-profile"
import type {
  BirthControlType,
  FlowLevel,
  HealthConditionOption,
  OnboardingPayload,
  PeriodHistoryEntry,
  SymptomOption,
} from "@/types/onboarding"

const SYMPTOM_OPTIONS: SymptomOption[] = [
  "cramps",
  "headache",
  "acne",
  "back_pain",
  "mood_swings",
  "tender_breasts",
  "fatigue",
  "bloating",
  "nausea",
  "cravings",
  "no_symptoms",
]

const CONDITION_OPTIONS: HealthConditionOption[] = [
  "pcos",
  "endometriosis",
  "fibroids",
  "anemia",
  "thyroid",
  "diabetes",
  "hypertension",
  "migraine",
  "depression",
  "anxiety",
  "none",
]

const TOTAL_STEPS = 8

function emptyPeriodEntry(): PeriodHistoryEntry {
  return { period_start: "", flow: "medium" }
}

function periodHistoryForMode(knowsThree: boolean): PeriodHistoryEntry[] {
  return Array.from({ length: knowsThree ? 3 : 1 }, emptyPeriodEntry)
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1
  return age
}

function calculateBmi(weight: number, height: number) {
  if (!weight || !height) return null
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

function defaultForm(user: UserProfile | null): OnboardingPayload {
  return {
    full_name: user?.full_name ?? "",
    date_of_birth: user?.date_of_birth ?? "",
    country: user?.country ?? "India",
    height: 160,
    weight: 55,
    language_preference: user?.language_preference ?? "english",
    timezone: user?.timezone ?? "Asia/Kolkata",
    knows_last_three_months: true,
    period_history: periodHistoryForMode(true),
    average_cycle_length: 28,
    average_period_length: 5,
    last_period_start: "",
    typical_flow: "medium",
    cycle_regularity: "regular",
    common_symptoms: [],
    health_conditions: [],
    sleep_hours: 7,
    water_intake_liters: 2,
    exercise_frequency: "weekly",
    stress_level: "medium",
    smoking: false,
    alcohol: false,
    trying_to_conceive: false,
    is_pregnant: false,
    is_breastfeeding: false,
    using_birth_control: false,
    birth_control_type: "none",
    notify_period: true,
    notify_ovulation: true,
    notify_medication: true,
    notify_daily_health: true,
  }
}

export function OnboardingWizard() {
  const { user } = useAuth()
  if (!user) return null
  return <OnboardingWizardForm key={user.id} user={user} />
}

function OnboardingWizardForm({ user }: { user: UserProfile }) {
  const { setHealthProfile, updateUser } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState<OnboardingPayload>(() => defaultForm(user))

  function updateField<K extends keyof OnboardingPayload>(key: K, value: OnboardingPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleListItem(
    key: "common_symptoms" | "health_conditions",
    value: SymptomOption | HealthConditionOption,
  ) {
    setForm((current) => {
      const list = current[key] as string[]
      const exists = list.includes(value)
      if (value === "no_symptoms" && key === "common_symptoms") {
        return { ...current, common_symptoms: exists ? [] : ["no_symptoms"] }
      }
      if (value === "none" && key === "health_conditions") {
        return { ...current, health_conditions: exists ? [] : ["none"] }
      }
      const filtered =
        key === "common_symptoms"
          ? list.filter((item) => item !== "no_symptoms")
          : list.filter((item) => item !== "none")
      return {
        ...current,
        [key]: exists ? filtered.filter((item) => item !== value) : [...filtered, value],
      }
    })
  }

  function updatePeriodHistory(
    index: number,
    key: keyof PeriodHistoryEntry,
    value: string,
  ) {
    setForm((current) => {
      const next = [...current.period_history]
      next[index] = { ...next[index], [key]: value }
      return { ...current, period_history: next }
    })
  }

  function setKnowsLastThreeMonths(knows: boolean) {
    setForm((current) => ({
      ...current,
      knows_last_three_months: knows,
      period_history: periodHistoryForMode(knows),
    }))
  }

  function validateStep(currentStep: number): boolean {
    if (currentStep === 0) {
      if (!form.date_of_birth) {
        toast.error(t("onboarding.validation.dateOfBirthRequired"))
        return false
      }
      if (!form.country) {
        toast.error(t("onboarding.validation.countryRequired"))
        return false
      }
      if (!form.height || form.height < 50) {
        toast.error(t("onboarding.validation.heightRequired"))
        return false
      }
      if (!form.weight || form.weight < 20) {
        toast.error(t("onboarding.validation.weightRequired"))
        return false
      }
    }

    if (currentStep === 1) {
      if (!form.average_cycle_length) {
        toast.error(t("onboarding.validation.cycleLengthRequired"))
        return false
      }
      for (const [index, entry] of form.period_history.entries()) {
        if (!entry.period_start) {
          toast.error(t("onboarding.validation.periodStartRequired", { month: String(index + 1) }))
          return false
        }
      }
    }

    return true
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))
  }

  async function finishSetup() {
    if (!validateStep(0) || !validateStep(1)) return

    const sortedHistory = [...form.period_history].sort(
      (a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime(),
    )
    const payload: OnboardingPayload = {
      ...form,
      period_history: sortedHistory,
      last_period_start: sortedHistory[0]?.period_start ?? "",
      typical_flow: sortedHistory[0]?.flow ?? "medium",
    }

    setSubmitting(true)
    try {
      const data = await onboardingService.completeOnboarding(payload)
      updateUser(() => data.user)
      setHealthProfile(data.health_profile)
      toast.success(t("onboarding.completeSuccess"))
      router.replace(getPostAuthPath(data.user))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  const age = calculateAge(form.date_of_birth)
  const bmi = calculateBmi(form.weight, form.height)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-primary">
          {t("onboarding.progress", { current: String(step + 1), total: String(TOTAL_STEPS) })}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Card className="glass-panel rounded-3xl border-border/60 shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{t(`onboarding.steps.${step}.title`)}</CardTitle>
          <CardDescription>{t(`onboarding.steps.${step}.description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <>
              <Field label={t("onboarding.fields.dateOfBirth")}>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={form.date_of_birth}
                  onChange={(e) => updateField("date_of_birth", e.target.value)}
                />
              </Field>
              <Field label={t("onboarding.fields.age")}>
                <Input className="rounded-xl" readOnly value={age ?? ""} />
              </Field>
              <Field label={t("onboarding.fields.country")}>
                <Select
                  className="rounded-xl"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("onboarding.fields.height")}>
                  <Input
                    type="number"
                    className="rounded-xl"
                    value={form.height}
                    onChange={(e) => updateField("height", Number(e.target.value))}
                  />
                </Field>
                <Field label={t("onboarding.fields.weight")}>
                  <Input
                    type="number"
                    className="rounded-xl"
                    value={form.weight}
                    onChange={(e) => updateField("weight", Number(e.target.value))}
                  />
                </Field>
              </div>
              <Field label={t("onboarding.fields.bmi")}>
                <Input className="rounded-xl" readOnly value={bmi ?? ""} />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label={t("onboarding.fields.cycleLength")}>
                <Input
                  type="number"
                  className="rounded-xl"
                  value={form.average_cycle_length}
                  onChange={(e) => updateField("average_cycle_length", Number(e.target.value))}
                />
              </Field>

              <div className="space-y-3 rounded-xl border border-border/60 p-4">
                <p className="text-sm font-medium">{t("onboarding.fields.periodHistoryMode")}</p>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="periodHistoryMode"
                    checked={form.knows_last_three_months}
                    onChange={() => setKnowsLastThreeMonths(true)}
                  />
                  {t("onboarding.fields.knowsLastThreeMonths")}
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="periodHistoryMode"
                    checked={!form.knows_last_three_months}
                    onChange={() => setKnowsLastThreeMonths(false)}
                  />
                  {t("onboarding.fields.knowsLastMonthOnly")}
                </label>
              </div>

              {form.period_history.map((entry, index) => (
                <div
                  key={`period-${index}`}
                  className="space-y-3 rounded-xl border border-border/60 p-4"
                >
                  <p className="text-sm font-medium">
                    {form.knows_last_three_months
                      ? t(`onboarding.periodMonths.${index}`)
                      : t("onboarding.fields.lastPeriodStart")}
                  </p>
                  <Field label={t("onboarding.fields.lastPeriodStart")}>
                    <Input
                      type="date"
                      className="rounded-xl"
                      value={entry.period_start}
                      onChange={(e) => updatePeriodHistory(index, "period_start", e.target.value)}
                    />
                  </Field>
                  <Field label={t("onboarding.fields.typicalFlow")}>
                    <Select
                      className="rounded-xl"
                      value={entry.flow}
                      onChange={(e) =>
                        updatePeriodHistory(index, "flow", e.target.value as FlowLevel)
                      }
                    >
                      {(["light", "medium", "heavy", "very_heavy"] as const).map((flow) => (
                        <option key={flow} value={flow}>
                          {t(`onboarding.flow.${flow}`)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              ))}
            </>
          ) : null}

          {step === 2 ? (
            <CheckboxGrid
              options={SYMPTOM_OPTIONS}
              selected={form.common_symptoms}
              onToggle={(value) => toggleListItem("common_symptoms", value)}
              labelPrefix="onboarding.symptoms"
              t={t}
            />
          ) : null}

          {step === 3 ? (
            <CheckboxGrid
              options={CONDITION_OPTIONS}
              selected={form.health_conditions}
              onToggle={(value) => toggleListItem("health_conditions", value)}
              labelPrefix="onboarding.conditions"
              t={t}
            />
          ) : null}

          {step === 4 ? (
            <>
              <Field label={t("onboarding.fields.sleepHours")}>
                <Input
                  type="number"
                  step="0.5"
                  className="rounded-xl"
                  value={form.sleep_hours}
                  onChange={(e) => updateField("sleep_hours", Number(e.target.value))}
                />
              </Field>
              <Field label={t("onboarding.fields.waterIntake")}>
                <Input
                  type="number"
                  step="0.1"
                  className="rounded-xl"
                  value={form.water_intake_liters}
                  onChange={(e) => updateField("water_intake_liters", Number(e.target.value))}
                />
              </Field>
              <Field label={t("onboarding.fields.exerciseFrequency")}>
                <Select
                  className="rounded-xl"
                  value={form.exercise_frequency}
                  onChange={(e) =>
                    updateField("exercise_frequency", e.target.value as OnboardingPayload["exercise_frequency"])
                  }
                >
                  {(["never", "rarely", "weekly", "daily"] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`onboarding.exercise.${item}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("onboarding.fields.stressLevel")}>
                <Select
                  className="rounded-xl"
                  value={form.stress_level}
                  onChange={(e) =>
                    updateField("stress_level", e.target.value as OnboardingPayload["stress_level"])
                  }
                >
                  {(["low", "medium", "high"] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`onboarding.stress.${item}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <ToggleRow
                label={t("onboarding.fields.smoking")}
                checked={form.smoking}
                onChange={(checked) => updateField("smoking", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.alcohol")}
                checked={form.alcohol}
                onChange={(checked) => updateField("alcohol", checked)}
              />
            </>
          ) : null}

          {step === 5 ? (
            <>
              <ToggleRow
                label={t("onboarding.fields.tryingToConceive")}
                checked={form.trying_to_conceive}
                onChange={(checked) => updateField("trying_to_conceive", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.pregnant")}
                checked={form.is_pregnant}
                onChange={(checked) => updateField("is_pregnant", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.breastfeeding")}
                checked={form.is_breastfeeding}
                onChange={(checked) => updateField("is_breastfeeding", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.usingBirthControl")}
                checked={form.using_birth_control}
                onChange={(checked) => updateField("using_birth_control", checked)}
              />
              {form.using_birth_control ? (
                <Field label={t("onboarding.fields.birthControlType")}>
                  <Select
                    className="rounded-xl"
                    value={form.birth_control_type}
                    onChange={(e) =>
                      updateField("birth_control_type", e.target.value as BirthControlType)
                    }
                  >
                    {(["pill", "iud", "implant", "injection", "condom", "other"] as const).map(
                      (item) => (
                        <option key={item} value={item}>
                          {t(`onboarding.birthControl.${item}`)}
                        </option>
                      ),
                    )}
                  </Select>
                </Field>
              ) : null}
            </>
          ) : null}

          {step === 6 ? (
            <>
              <ToggleRow
                label={t("onboarding.fields.notifyPeriod")}
                checked={form.notify_period}
                onChange={(checked) => updateField("notify_period", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.notifyOvulation")}
                checked={form.notify_ovulation}
                onChange={(checked) => updateField("notify_ovulation", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.notifyMedication")}
                checked={form.notify_medication}
                onChange={(checked) => updateField("notify_medication", checked)}
              />
              <ToggleRow
                label={t("onboarding.fields.notifyDailyHealth")}
                checked={form.notify_daily_health}
                onChange={(checked) => updateField("notify_daily_health", checked)}
              />
            </>
          ) : null}

          {step === 7 ? (
            <div className="space-y-3 text-sm">
              <SummaryRow label={t("onboarding.fields.dateOfBirth")} value={form.date_of_birth} />
              <SummaryRow
                label={t("onboarding.fields.age")}
                value={age != null ? String(age) : ""}
              />
              <SummaryRow label={t("onboarding.fields.country")} value={form.country} />
              <SummaryRow label={t("onboarding.fields.bmi")} value={bmi != null ? String(bmi) : ""} />
              <SummaryRow
                label={t("onboarding.fields.cycleLength")}
                value={String(form.average_cycle_length)}
              />
              <SummaryRow
                label={t("onboarding.fields.lastPeriodStart")}
                value={form.period_history[0]?.period_start ?? ""}
              />
              <SummaryRow
                label={t("onboarding.fields.symptoms")}
                value={form.common_symptoms.map((s) => t(`onboarding.symptoms.${s}`)).join(", ")}
              />
              <SummaryRow
                label={t("onboarding.fields.conditions")}
                value={form.health_conditions.map((c) => t(`onboarding.conditions.${c}`)).join(", ")}
              />
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={step === 0 || submitting}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            {t("common.back")}
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" className="rounded-full" onClick={goNext}>
              {t("onboarding.next")}
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full"
              disabled={submitting}
              onClick={() => void finishSetup()}
            >
              {submitting ? t("onboarding.finishing") : t("onboarding.finish")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function CheckboxGrid<T extends string>({
  options,
  selected,
  onToggle,
  labelPrefix,
  t,
}: {
  options: T[]
  selected: T[]
  onToggle: (value: T) => void
  labelPrefix: string
  t: (key: string) => string
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm"
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
          />
          {t(`${labelPrefix}.${option}`)}
        </label>
      ))}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-muted/40 px-4 py-3 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}
