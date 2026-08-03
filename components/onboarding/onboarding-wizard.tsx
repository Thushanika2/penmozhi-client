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
import { compareDateKeysDesc } from "@/lib/date-only"
import { getPostAuthPath } from "@/lib/auth-redirect"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import {
  isMenstrualBaselineStepComplete,
  MenstrualBaselineStep,
} from "@/components/onboarding/menstrual-baseline-step"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import * as onboardingService from "@/services/onboarding"
import { COUNTRIES } from "@/lib/countries"
import type { UserProfile } from "@/types/user-profile"
import type {
  BirthControlType,
  ExerciseFrequency,
  FlowLevel,
  HealthConditionOption,
  OnboardingPayload,
  StressLevel,
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

type OnboardingFormState = Omit<
  OnboardingPayload,
  "exercise_frequency" | "stress_level" | "smoking" | "alcohol" | "is_teenager"
> & {
  exercise_frequency: ExerciseFrequency | ""
  stress_level: StressLevel | ""
  smoking: boolean | null
  alcohol: boolean | null
  reproductive_none: boolean
}

function isTeenagerFromDateOfBirth(dateOfBirth: string): boolean {
  const age = calculateAge(dateOfBirth)
  return age !== null && age >= 13 && age <= 19
}

function isBasicInfoStepComplete(form: OnboardingFormState): boolean {
  return (
    Boolean(form.date_of_birth) &&
    Boolean(form.country.trim()) &&
    form.height >= 50 &&
    form.height <= 300 &&
    form.weight >= 20 &&
    form.weight <= 500
  )
}

function isLifestyleStepComplete(form: OnboardingFormState): boolean {
  return (
    form.sleep_hours >= 0.5 &&
    form.water_intake_liters >= 0.1 &&
    Boolean(form.exercise_frequency) &&
    Boolean(form.stress_level) &&
    form.smoking !== null &&
    form.alcohol !== null
  )
}

function isReproductiveStepComplete(form: OnboardingFormState): boolean {
  const hasAnswer =
    form.reproductive_none ||
    form.trying_to_conceive ||
    form.is_pregnant ||
    form.is_breastfeeding ||
    form.using_birth_control

  if (!hasAnswer) return false
  if (!form.using_birth_control) return true
  return Boolean(form.birth_control_type) && form.birth_control_type !== "none"
}

function isStepComplete(stepIndex: number, form: OnboardingFormState): boolean {
  if (stepIndex === 0) return isBasicInfoStepComplete(form)
  if (stepIndex === 1) {
    return isMenstrualBaselineStepComplete(form.average_cycle_length, form.period_history)
  }
  if (stepIndex === 2) return form.common_symptoms.length > 0
  if (stepIndex === 3) return form.health_conditions.length > 0
  if (stepIndex === 4) return isLifestyleStepComplete(form)
  if (stepIndex === 5) return isReproductiveStepComplete(form)
  // Steps 6 (notifications) and 7 (summary) are optional / review-only.
  return true
}

type StepFieldErrors = Partial<Record<string, string>>

function getStepFieldErrors(
  stepIndex: number,
  form: OnboardingFormState,
  t: (key: string) => string,
): StepFieldErrors {
  const errors: StepFieldErrors = {}
  if (stepIndex === 0) {
    if (!form.date_of_birth) errors.date_of_birth = t("onboarding.validation.dateOfBirthRequired")
    if (!form.country.trim()) errors.country = t("onboarding.validation.countryRequired")
    if (!form.height || form.height < 50 || form.height > 300) {
      errors.height = t("onboarding.validation.heightRequired")
    }
    if (!form.weight || form.weight < 20 || form.weight > 500) {
      errors.weight = t("onboarding.validation.weightRequired")
    }
  }
  if (stepIndex === 1) {
    if (!form.average_cycle_length || form.average_cycle_length < 21 || form.average_cycle_length > 45) {
      errors.average_cycle_length = t("onboarding.validation.cycleLengthRequired")
    }
    if (form.period_history.length < 1) {
      errors.period_history = t("onboarding.validation.atLeastOnePeriod")
    } else if (form.period_history.some((entry) => !entry.flow)) {
      errors.period_history = t("onboarding.validation.flowRequired")
    }
  }
  if (stepIndex === 2 && !form.common_symptoms.length) {
    errors.common_symptoms = t("onboarding.validation.symptomsRequired")
  }
  if (stepIndex === 3 && !form.health_conditions.length) {
    errors.health_conditions = t("onboarding.validation.conditionsRequired")
  }
  if (stepIndex === 4) {
    if (!form.sleep_hours || form.sleep_hours < 0.5) {
      errors.sleep_hours = t("onboarding.validation.sleepHoursRequired")
    }
    if (!form.water_intake_liters || form.water_intake_liters < 0.1) {
      errors.water_intake_liters = t("onboarding.validation.waterIntakeRequired")
    }
    if (!form.exercise_frequency) {
      errors.exercise_frequency = t("onboarding.validation.exerciseRequired")
    }
    if (!form.stress_level) errors.stress_level = t("onboarding.validation.stressRequired")
    if (form.smoking === null) errors.smoking = t("onboarding.validation.smokingRequired")
    if (form.alcohol === null) errors.alcohol = t("onboarding.validation.alcoholRequired")
  }
  if (stepIndex === 5) {
    const hasAnswer =
      form.reproductive_none ||
      form.trying_to_conceive ||
      form.is_pregnant ||
      form.is_breastfeeding ||
      form.using_birth_control
    if (!hasAnswer) {
      errors.reproductive = t("onboarding.validation.reproductiveRequired")
    }
    if (form.using_birth_control && form.birth_control_type === "none") {
      errors.birth_control_type = t("onboarding.validation.birthControlTypeRequired")
    }
  }
  return errors
}

const DRAFT_STORAGE_PREFIX = "penmozhi_onboarding_draft_"

function loadDraft(userId: number): { step: number; form: OnboardingFormState } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${userId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { step?: number; form?: OnboardingFormState }
    if (!parsed.form || typeof parsed.step !== "number") return null
    return { step: Math.min(Math.max(parsed.step, 0), TOTAL_STEPS - 1), form: parsed.form }
  } catch {
    return null
  }
}

function saveDraft(userId: number, step: number, form: OnboardingFormState) {
  if (typeof window === "undefined") return
  localStorage.setItem(
    `${DRAFT_STORAGE_PREFIX}${userId}`,
    JSON.stringify({ step, form }),
  )
}

function clearDraft(userId: number) {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${userId}`)
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

function defaultForm(user: UserProfile | null): OnboardingFormState {
  return {
    full_name: user?.full_name ?? "",
    date_of_birth: user?.date_of_birth ?? "",
    country: user?.country ?? "",
    height: 0,
    weight: 0,
    language_preference: user?.language_preference ?? "english",
    timezone: user?.timezone ?? "Asia/Kolkata",
    period_history: [],
    average_cycle_length: 0,
    average_period_length: 5,
    last_period_start: "",
    typical_flow: "medium",
    cycle_regularity: "regular",
    common_symptoms: [],
    health_conditions: [],
    sleep_hours: 0,
    water_intake_liters: 0,
    exercise_frequency: "",
    stress_level: "",
    smoking: null,
    alcohol: null,
    trying_to_conceive: false,
    is_pregnant: false,
    is_breastfeeding: false,
    using_birth_control: false,
    birth_control_type: "none",
    reproductive_none: false,
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
  const { t, locale } = useLanguage()
  const router = useRouter()
  const initialDraft = React.useMemo(() => loadDraft(user.id), [user.id])
  const [step, setStep] = React.useState(initialDraft?.step ?? 0)
  const [submitting, setSubmitting] = React.useState(false)
  const [attemptedContinue, setAttemptedContinue] = React.useState(false)
  const [form, setForm] = React.useState<OnboardingFormState>(
    () => initialDraft?.form ?? defaultForm(user),
  )

  React.useEffect(() => {
    saveDraft(user.id, step, form)
  }, [user.id, step, form])

  React.useEffect(() => {
    // Keep incomplete users on the onboarding route if they use browser back/forward.
    const lockHistory = () => {
      if (window.location.pathname !== "/onboarding") {
        router.replace("/onboarding")
      }
    }
    window.history.pushState(null, "", "/onboarding")
    window.addEventListener("popstate", lockHistory)
    return () => window.removeEventListener("popstate", lockHistory)
  }, [router])

  function updateField<K extends keyof OnboardingFormState>(key: K, value: OnboardingFormState[K]) {
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

  function toggleReproductiveOption(
    option:
      | "reproductive_none"
      | "trying_to_conceive"
      | "is_pregnant"
      | "is_breastfeeding"
      | "using_birth_control",
  ) {
    setForm((current) => {
      if (option === "reproductive_none") {
        const next = !current.reproductive_none
        return {
          ...current,
          reproductive_none: next,
          trying_to_conceive: false,
          is_pregnant: false,
          is_breastfeeding: false,
          using_birth_control: false,
          birth_control_type: "none",
        }
      }

      const nextValue = !current[option]
      return {
        ...current,
        reproductive_none: false,
        [option]: nextValue,
        ...(option === "using_birth_control" && !nextValue
          ? { birth_control_type: "none" as BirthControlType }
          : {}),
      }
    })
  }

  function validateStep(currentStep: number): boolean {
    const errors = getStepFieldErrors(currentStep, form, t)
    const firstError = Object.values(errors)[0]
    if (firstError) {
      toast.error(firstError)
      return false
    }
    return true
  }

  function validateRequiredSteps(): boolean {
    for (const stepIndex of [0, 1, 2, 3, 4]) {
      if (!validateStep(stepIndex)) {
        setStep(stepIndex)
        setAttemptedContinue(true)
        return false
      }
    }
    if (!isReproductiveStepComplete(form)) {
      setStep(5)
      setAttemptedContinue(true)
      toast.error(t("onboarding.validation.birthControlTypeRequired"))
      return false
    }
    return true
  }

  function goNext() {
    setAttemptedContinue(true)
    if (!validateStep(step)) return
    setAttemptedContinue(false)
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))
  }

  function goBack() {
    setAttemptedContinue(false)
    // Step 1 (index 0): leave the wizard for registration.
    // GuestRoute on /auth/register redirects already-authenticated users
    // (JWT from successful signup) back into onboarding via getPostAuthPath.
    if (step === 0) {
      router.push("/auth/register")
      return
    }
    setStep((current) => Math.max(0, current - 1))
  }

  async function finishSetup() {
    if (!validateRequiredSteps()) return

    const sortedHistory = [...form.period_history].sort((a, b) =>
      compareDateKeysDesc(a.period_start, b.period_start),
    )
    const { reproductive_none, exercise_frequency, stress_level, smoking, alcohol, ...rest } =
      form
    void reproductive_none
    const payload: OnboardingPayload = {
      ...rest,
      exercise_frequency: exercise_frequency as ExerciseFrequency,
      stress_level: stress_level as StressLevel,
      smoking: smoking ?? false,
      alcohol: alcohol ?? false,
      is_teenager: isTeenagerFromDateOfBirth(form.date_of_birth),
      period_history: sortedHistory.map((entry) => ({
        period_start: entry.period_start,
        flow: entry.flow as FlowLevel,
      })),
      last_period_start: sortedHistory[0]?.period_start ?? "",
      typical_flow: (sortedHistory[0]?.flow as FlowLevel) ?? "medium",
    }

    setSubmitting(true)
    try {
      const data = await onboardingService.completeOnboarding(payload)
      clearDraft(user.id)
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
  const stepComplete = isStepComplete(step, form)
  const fieldErrors = attemptedContinue ? getStepFieldErrors(step, form, t) : {}
  const sortedPeriodHistory = [...form.period_history].sort((a, b) =>
    compareDateKeysDesc(a.period_start, b.period_start),
  )

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
              <Field
                label={t("onboarding.fields.dateOfBirth")}
                error={fieldErrors.date_of_birth}
              >
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
              <Field label={t("onboarding.fields.country")} error={fieldErrors.country}>
                <Select
                  className="rounded-xl"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                >
                  <option value="" disabled>
                    {t("onboarding.placeholders.selectCountry")}
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("onboarding.fields.height")} error={fieldErrors.height}>
                  <Input
                    type="number"
                    className="rounded-xl"
                    placeholder={t("onboarding.placeholders.heightCm")}
                    value={form.height || ""}
                    onChange={(e) => updateField("height", Number(e.target.value))}
                  />
                </Field>
                <Field label={t("onboarding.fields.weight")} error={fieldErrors.weight}>
                  <Input
                    type="number"
                    className="rounded-xl"
                    placeholder={t("onboarding.placeholders.weightKg")}
                    value={form.weight || ""}
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
            <MenstrualBaselineStep
              locale={locale}
              averageCycleLength={form.average_cycle_length}
              periodHistory={form.period_history}
              onCycleLengthChange={(value) => updateField("average_cycle_length", value)}
              onPeriodHistoryChange={(entries) => updateField("period_history", entries)}
              cycleLengthError={fieldErrors.average_cycle_length}
              periodHistoryError={fieldErrors.period_history}
              t={t}
            />
          ) : null}

          {step === 2 ? (
            <>
              <CheckboxGrid
                options={SYMPTOM_OPTIONS}
                selected={form.common_symptoms}
                onToggle={(value) => toggleListItem("common_symptoms", value)}
                labelPrefix="onboarding.symptoms"
                t={t}
              />
              {fieldErrors.common_symptoms ? (
                <p className="text-sm text-destructive">{fieldErrors.common_symptoms}</p>
              ) : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <CheckboxGrid
                options={CONDITION_OPTIONS}
                selected={form.health_conditions}
                onToggle={(value) => toggleListItem("health_conditions", value)}
                labelPrefix="onboarding.conditions"
                t={t}
              />
              {fieldErrors.health_conditions ? (
                <p className="text-sm text-destructive">{fieldErrors.health_conditions}</p>
              ) : null}
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Field label={t("onboarding.fields.sleepHours")} error={fieldErrors.sleep_hours}>
                <Input
                  type="number"
                  step="0.5"
                  className="rounded-xl"
                  placeholder={t("onboarding.placeholders.sleepHours")}
                  value={form.sleep_hours || ""}
                  onChange={(e) => updateField("sleep_hours", Number(e.target.value))}
                />
              </Field>
              <Field
                label={t("onboarding.fields.waterIntake")}
                error={fieldErrors.water_intake_liters}
              >
                <Input
                  type="number"
                  step="0.1"
                  className="rounded-xl"
                  placeholder={t("onboarding.placeholders.waterLiters")}
                  value={form.water_intake_liters || ""}
                  onChange={(e) => updateField("water_intake_liters", Number(e.target.value))}
                />
              </Field>
              <Field
                label={t("onboarding.fields.exerciseFrequency")}
                error={fieldErrors.exercise_frequency}
              >
                <Select
                  className="rounded-xl"
                  value={form.exercise_frequency}
                  onChange={(e) =>
                    updateField("exercise_frequency", e.target.value as ExerciseFrequency | "")
                  }
                >
                  <option value="" disabled>
                    {t("onboarding.placeholders.selectExercise")}
                  </option>
                  {(["never", "rarely", "weekly", "daily"] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`onboarding.exercise.${item}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("onboarding.fields.stressLevel")} error={fieldErrors.stress_level}>
                <Select
                  className="rounded-xl"
                  value={form.stress_level}
                  onChange={(e) => updateField("stress_level", e.target.value as StressLevel | "")}
                >
                  <option value="" disabled>
                    {t("onboarding.placeholders.selectStress")}
                  </option>
                  {(["low", "medium", "high"] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`onboarding.stress.${item}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <YesNoField
                label={t("onboarding.fields.smoking")}
                value={form.smoking}
                onChange={(value) => updateField("smoking", value)}
                error={fieldErrors.smoking}
                t={t}
              />
              <YesNoField
                label={t("onboarding.fields.alcohol")}
                value={form.alcohol}
                onChange={(value) => updateField("alcohol", value)}
                error={fieldErrors.alcohol}
                t={t}
              />
            </>
          ) : null}

          {step === 5 ? (
            <>
              <ToggleRow
                label={t("onboarding.fields.tryingToConceive")}
                checked={form.trying_to_conceive}
                onChange={() => toggleReproductiveOption("trying_to_conceive")}
              />
              <ToggleRow
                label={t("onboarding.fields.pregnant")}
                checked={form.is_pregnant}
                onChange={() => toggleReproductiveOption("is_pregnant")}
              />
              <ToggleRow
                label={t("onboarding.fields.breastfeeding")}
                checked={form.is_breastfeeding}
                onChange={() => toggleReproductiveOption("is_breastfeeding")}
              />
              <ToggleRow
                label={t("onboarding.fields.usingBirthControl")}
                checked={form.using_birth_control}
                onChange={() => toggleReproductiveOption("using_birth_control")}
              />
              {form.using_birth_control ? (
                <Field
                  label={t("onboarding.fields.birthControlType")}
                  error={fieldErrors.birth_control_type}
                >
                  <Select
                    className="rounded-xl"
                    value={
                      form.birth_control_type === "none" ? "" : form.birth_control_type
                    }
                    onChange={(e) =>
                      updateField("birth_control_type", e.target.value as BirthControlType)
                    }
                  >
                    <option value="" disabled>
                      {t("onboarding.placeholders.selectBirthControl")}
                    </option>
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
              <ToggleRow
                label={t("onboarding.fields.noneOfTheAbove")}
                checked={form.reproductive_none}
                onChange={() => toggleReproductiveOption("reproductive_none")}
              />
              {fieldErrors.reproductive ? (
                <p className="text-sm text-destructive">{fieldErrors.reproductive}</p>
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
                value={sortedPeriodHistory[0]?.period_start ?? ""}
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
            disabled={submitting}
            onClick={goBack}
          >
            {t("common.back")}
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              className="rounded-full"
              disabled={!stepComplete || submitting}
              onClick={goNext}
            >
              {t("onboarding.next")}
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full"
              disabled={submitting || !isStepComplete(0, form) || !isStepComplete(1, form) || !isStepComplete(2, form) || !isStepComplete(3, form) || !isStepComplete(4, form) || !isReproductiveStepComplete(form)}
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

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function YesNoField({
  label,
  value,
  onChange,
  error,
  t,
}: {
  label: string
  value: boolean | null
  onChange: (value: boolean) => void
  error?: string
  t: (key: string) => string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={value === true ? "default" : "outline"}
          className="rounded-full"
          aria-pressed={value === true}
          onClick={() => onChange(true)}
        >
          {t("common.yes")}
        </Button>
        <Button
          type="button"
          variant={value === false ? "default" : "outline"}
          className="rounded-full"
          aria-pressed={value === false}
          onClick={() => onChange(false)}
        >
          {t("common.no")}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
