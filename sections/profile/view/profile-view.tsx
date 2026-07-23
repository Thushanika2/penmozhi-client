"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { LanguageSwitcher } from "@/components/language-switcher"
import { PageHeader } from "@/components/page-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { deleteAccount, updateProfile } from "@/services/auth"
import {
  getHealthProfileRisks,
  updateHealthProfile,
} from "@/services/health-profile"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import type {
  BirthControlType,
  HealthConditionOption,
  SymptomOption,
} from "@/types/onboarding"
import type { HealthProfile } from "@/types/health-profile"
import type { UserProfile } from "@/types/user-profile"

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
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function buildAccountForm(user: UserProfile) {
  return {
    fullName: user.full_name ?? "",
    country: user.country ?? "",
    timezone: user.timezone ?? "Asia/Kolkata",
    dateOfBirth: user.date_of_birth ?? "",
  }
}

function buildHealthForm(healthProfile: HealthProfile) {
  return {
    weight: healthProfile.weight != null ? String(healthProfile.weight) : "",
    height: healthProfile.height != null ? String(healthProfile.height) : "",
    menarcheAge: healthProfile.menarche_age != null ? String(healthProfile.menarche_age) : "",
    averageCycleLength:
      healthProfile.average_cycle_length != null
        ? String(healthProfile.average_cycle_length)
        : "",
    averagePeriodLength:
      healthProfile.average_period_length != null
        ? String(healthProfile.average_period_length)
        : "",
    lastPeriodStart: healthProfile.last_period_start ?? "",
    typicalFlow: healthProfile.typical_flow ?? "medium",
    cycleRegularity: healthProfile.cycle_regularity ?? "regular",
    commonSymptoms: healthProfile.common_symptoms ?? [],
    healthConditions: healthProfile.health_conditions ?? [],
    nutritionalNeeds: healthProfile.nutritional_needs ?? "",
    healthRisks: healthProfile.health_risks ?? "",
    sleepHours: healthProfile.sleep_hours != null ? String(healthProfile.sleep_hours) : "",
    waterIntakeLiters:
      healthProfile.water_intake_liters != null
        ? String(healthProfile.water_intake_liters)
        : "",
    exerciseFrequency: healthProfile.exercise_frequency ?? "weekly",
    stressLevel: healthProfile.stress_level ?? "medium",
    smoking: healthProfile.smoking,
    alcohol: healthProfile.alcohol,
    tryingToConceive: healthProfile.trying_to_conceive,
    isTeenager: healthProfile.is_teenager,
    isPregnant: healthProfile.is_pregnant,
    isBreastfeeding: healthProfile.is_breastfeeding,
    usingBirthControl: healthProfile.using_birth_control,
    birthControlType: healthProfile.birth_control_type ?? "none",
    notifyPeriod: healthProfile.notify_period,
    notifyOvulation: healthProfile.notify_ovulation,
    notifyMedication: healthProfile.notify_medication,
    notifyDailyHealth: healthProfile.notify_daily_health,
  }
}

export function ProfileView() {
  const auth = useAuth()
  const { user, healthProfile } = auth
  if (!user) return null

  return (
    <ProfileViewContent
      key={`${user.id}-${healthProfile?.id ?? 0}-${healthProfile?.updated_at ?? ""}`}
      user={user}
      healthProfile={healthProfile}
      setHealthProfile={auth.setHealthProfile}
      updateUser={auth.updateUser}
      logout={auth.logout}
    />
  )
}

function ProfileViewContent({
  user,
  healthProfile,
  setHealthProfile,
  updateUser,
  logout,
}: {
  user: UserProfile
  healthProfile: HealthProfile | null
  setHealthProfile: ReturnType<typeof useAuth>["setHealthProfile"]
  updateUser: ReturnType<typeof useAuth>["updateUser"]
  logout: ReturnType<typeof useAuth>["logout"]
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const { data: risks = null } = useQuery({
    queryKey: queryKeys.profile.risks(healthProfile?.id ?? 0),
    queryFn: () => getHealthProfileRisks(healthProfile!.id),
    enabled: Boolean(healthProfile?.id),
  })
  const [savingAccount, setSavingAccount] = React.useState(false)
  const [savingHealth, setSavingHealth] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deletePassword, setDeletePassword] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

  const [accountForm, setAccountForm] = React.useState(() => buildAccountForm(user))

  const [healthForm, setHealthForm] = React.useState(() =>
    healthProfile ? buildHealthForm(healthProfile) : {
      weight: "",
      height: "",
      menarcheAge: "",
      averageCycleLength: "",
      averagePeriodLength: "",
      lastPeriodStart: "",
      typicalFlow: "medium",
      cycleRegularity: "regular",
      commonSymptoms: [] as SymptomOption[],
      healthConditions: [] as HealthConditionOption[],
      nutritionalNeeds: "",
      healthRisks: "",
      sleepHours: "",
      waterIntakeLiters: "",
      exerciseFrequency: "weekly",
      stressLevel: "medium",
      smoking: false,
      alcohol: false,
      tryingToConceive: false,
      isTeenager: false,
      isPregnant: false,
      isBreastfeeding: false,
      usingBirthControl: false,
      birthControlType: "none" as BirthControlType,
      notifyPeriod: true,
      notifyOvulation: true,
      notifyMedication: true,
      notifyDailyHealth: true,
    },
  )

  function toggleSymptom(option: SymptomOption) {
    setHealthForm((current) => {
      const exists = current.commonSymptoms.includes(option)
      const next = exists
        ? current.commonSymptoms.filter((item) => item !== option)
        : [...current.commonSymptoms, option]
      return { ...current, commonSymptoms: next }
    })
  }

  function toggleCondition(option: HealthConditionOption) {
    setHealthForm((current) => {
      const exists = current.healthConditions.includes(option)
      const next = exists
        ? current.healthConditions.filter((item) => item !== option)
        : [...current.healthConditions, option]
      return { ...current, healthConditions: next }
    })
  }

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault()
    setSavingAccount(true)
    try {
      const result = await updateProfile({
        full_name: accountForm.fullName.trim(),
        country: accountForm.country.trim() || null,
        timezone: accountForm.timezone.trim(),
        date_of_birth: accountForm.dateOfBirth,
      })
      updateUser(() => result.user)
      toast.success(t("profile.account.saved"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSavingAccount(false)
    }
  }

  async function saveHealth(event: React.FormEvent) {
    event.preventDefault()
    if (!healthProfile) return
    setSavingHealth(true)
    try {
      const result = await updateHealthProfile(healthProfile.id, {
        weight: healthForm.weight ? Number(healthForm.weight) : null,
        height: healthForm.height ? Number(healthForm.height) : null,
        menarche_age: healthForm.menarcheAge ? Number(healthForm.menarcheAge) : null,
        average_cycle_length: healthForm.averageCycleLength
          ? Number(healthForm.averageCycleLength)
          : null,
        average_period_length: healthForm.averagePeriodLength
          ? Number(healthForm.averagePeriodLength)
          : null,
        last_period_start: healthForm.lastPeriodStart || null,
        typical_flow: healthForm.typicalFlow as HealthProfile["typical_flow"],
        cycle_regularity: healthForm.cycleRegularity as HealthProfile["cycle_regularity"],
        common_symptoms: healthForm.commonSymptoms,
        health_conditions: healthForm.healthConditions,
        nutritional_needs: healthForm.nutritionalNeeds || null,
        health_risks: healthForm.healthRisks || null,
        sleep_hours: healthForm.sleepHours ? Number(healthForm.sleepHours) : null,
        water_intake_liters: healthForm.waterIntakeLiters
          ? Number(healthForm.waterIntakeLiters)
          : null,
        exercise_frequency: healthForm.exerciseFrequency as HealthProfile["exercise_frequency"],
        stress_level: healthForm.stressLevel as HealthProfile["stress_level"],
        smoking: healthForm.smoking,
        alcohol: healthForm.alcohol,
        trying_to_conceive: healthForm.tryingToConceive,
        is_teenager: healthForm.isTeenager,
        is_pregnant: healthForm.isPregnant,
        is_breastfeeding: healthForm.isBreastfeeding,
        using_birth_control: healthForm.usingBirthControl,
        birth_control_type: healthForm.birthControlType,
        notify_period: healthForm.notifyPeriod,
        notify_ovulation: healthForm.notifyOvulation,
        notify_medication: healthForm.notifyMedication,
        notify_daily_health: healthForm.notifyDailyHealth,
      })
      setHealthProfile(result.health_profile)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profile.risks(healthProfile.id),
      })
      toast.success(t("profile.updated"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setSavingHealth(false)
    }
  }

  async function confirmDeleteAccount() {
    if (!deletePassword.trim()) return
    setDeleting(true)
    try {
      await deleteAccount(deletePassword)
      toast.success(t("profile.delete.success"))
      setDeleteOpen(false)
      await logout()
      router.replace("/")
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setDeleting(false)
    }
  }

  const languageLabel =
    user?.language_preference === "tamil" ? t("common.tamil") : t("common.english")

  return (
    <div>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.account.title")}</CardTitle>
            <CardDescription>{t("profile.account.description")}</CardDescription>
          </CardHeader>
          <form onSubmit={saveAccount}>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label={t("profile.account.name")}>
                <Input
                  value={accountForm.fullName}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
              </Field>
              <Field label={t("profile.account.email")}>
                <Input value={user?.email ?? ""} disabled />
              </Field>
              <Field label={t("profile.account.dateOfBirth")}>
                <Input
                  type="date"
                  value={accountForm.dateOfBirth}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                  }
                />
              </Field>
              <Field label={t("profile.account.country")}>
                <Input
                  value={accountForm.country}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </Field>
              <Field label={t("profile.account.timezone")}>
                <Input
                  value={accountForm.timezone}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, timezone: event.target.value }))
                  }
                />
              </Field>
              <div className="space-y-2">
                <Label>{t("profile.account.language")}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{languageLabel}</Badge>
                  <LanguageSwitcher />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.appearance.title")}</Label>
                <ThemeToggle />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={savingAccount} className="rounded-full">
                  {savingAccount ? t("common.saving") : t("profile.account.save")}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.risks.title")}</CardTitle>
            <CardDescription>{t("profile.risks.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t("profile.risks.bmi")}:{" "}
              <strong>{risks?.calculated_bmi?.toFixed(1) ?? "—"}</strong>
              {risks?.bmi_category ? ` (${t(`profile.risks.categories.${risks.bmi_category}`)})` : ""}
            </p>
            <p>
              {t("profile.risks.nutritionalNeeds")}:{" "}
              {risks?.nutritional_needs ?? t("common.notSet")}
            </p>
            <p>
              {t("profile.risks.healthRisks")}: {risks?.health_risks ?? t("common.notSet")}
            </p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={saveHealth} className="mt-6 space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.health.title")}</CardTitle>
            <CardDescription>{t("profile.health.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t("profile.form.weight")}>
              <Input
                type="number"
                step="0.1"
                value={healthForm.weight}
                onChange={(event) => setHealthForm((c) => ({ ...c, weight: event.target.value }))}
              />
            </Field>
            <Field label={t("profile.form.height")}>
              <Input
                type="number"
                step="0.1"
                value={healthForm.height}
                onChange={(event) => setHealthForm((c) => ({ ...c, height: event.target.value }))}
              />
            </Field>
            <Field label={t("profile.health.menarcheAge")}>
              <Input
                type="number"
                value={healthForm.menarcheAge}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, menarcheAge: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.health.lastPeriodStart")}>
              <Input
                type="date"
                value={healthForm.lastPeriodStart}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, lastPeriodStart: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.health.averageCycleLength")}>
              <Input
                type="number"
                value={healthForm.averageCycleLength}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, averageCycleLength: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.health.averagePeriodLength")}>
              <Input
                type="number"
                value={healthForm.averagePeriodLength}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, averagePeriodLength: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.health.typicalFlow")}>
              <Select
                value={healthForm.typicalFlow}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, typicalFlow: event.target.value }))
                }
              >
                {(["light", "medium", "heavy", "very_heavy"] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(`cycle.flow.${value === "very_heavy" ? "veryHeavy" : value}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("profile.health.cycleRegularity")}>
              <Select
                value={healthForm.cycleRegularity}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, cycleRegularity: event.target.value }))
                }
              >
                <option value="regular">{t("profile.health.regular")}</option>
                <option value="irregular">{t("profile.health.irregular")}</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("profile.symptoms.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {SYMPTOM_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={healthForm.commonSymptoms.includes(option)}
                    onChange={() => toggleSymptom(option)}
                  />
                  {t(`onboarding.symptoms.${option}`)}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>{t("profile.conditions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {CONDITION_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={healthForm.healthConditions.includes(option)}
                    onChange={() => toggleCondition(option)}
                  />
                  {t(`onboarding.conditions.${option}`)}
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.lifestyle.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t("profile.lifestyle.sleepHours")}>
              <Input
                type="number"
                step="0.5"
                value={healthForm.sleepHours}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, sleepHours: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.lifestyle.waterIntake")}>
              <Input
                type="number"
                step="0.1"
                value={healthForm.waterIntakeLiters}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, waterIntakeLiters: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.lifestyle.exercise")}>
              <Select
                value={healthForm.exerciseFrequency}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, exerciseFrequency: event.target.value }))
                }
              >
                {(["never", "rarely", "weekly", "daily"] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(`onboarding.exercise.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("profile.lifestyle.stress")}>
              <Select
                value={healthForm.stressLevel}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, stressLevel: event.target.value }))
                }
              >
                {(["low", "medium", "high"] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(`onboarding.stress.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <ToggleRow
              label={t("profile.lifestyle.smoking")}
              checked={healthForm.smoking}
              onChange={(checked) => setHealthForm((c) => ({ ...c, smoking: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.alcohol")}
              checked={healthForm.alcohol}
              onChange={(checked) => setHealthForm((c) => ({ ...c, alcohol: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.isTeenager")}
              checked={healthForm.isTeenager}
              onChange={(checked) => setHealthForm((c) => ({ ...c, isTeenager: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.tryingToConceive")}
              checked={healthForm.tryingToConceive}
              onChange={(checked) => setHealthForm((c) => ({ ...c, tryingToConceive: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.isPregnant")}
              checked={healthForm.isPregnant}
              onChange={(checked) => setHealthForm((c) => ({ ...c, isPregnant: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.isBreastfeeding")}
              checked={healthForm.isBreastfeeding}
              onChange={(checked) => setHealthForm((c) => ({ ...c, isBreastfeeding: checked }))}
            />
            <ToggleRow
              label={t("profile.lifestyle.usingBirthControl")}
              checked={healthForm.usingBirthControl}
              onChange={(checked) => setHealthForm((c) => ({ ...c, usingBirthControl: checked }))}
            />
            {healthForm.usingBirthControl ? (
              <Field label={t("profile.lifestyle.birthControlType")}>
                <Select
                  value={healthForm.birthControlType}
                  onChange={(event) =>
                    setHealthForm((c) => ({
                      ...c,
                      birthControlType: event.target.value as BirthControlType,
                    }))
                  }
                >
                  {(["none", "pill", "iud", "implant", "injection", "condom", "other"] as const).map(
                    (value) => (
                      <option key={value} value={value}>
                        {t(`onboarding.birthControl.${value}`)}
                      </option>
                    ),
                  )}
                </Select>
              </Field>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.notifications.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            <ToggleRow
              label={t("profile.notifications.period")}
              checked={healthForm.notifyPeriod}
              onChange={(checked) => setHealthForm((c) => ({ ...c, notifyPeriod: checked }))}
            />
            <ToggleRow
              label={t("profile.notifications.ovulation")}
              checked={healthForm.notifyOvulation}
              onChange={(checked) => setHealthForm((c) => ({ ...c, notifyOvulation: checked }))}
            />
            <ToggleRow
              label={t("profile.notifications.medication")}
              checked={healthForm.notifyMedication}
              onChange={(checked) => setHealthForm((c) => ({ ...c, notifyMedication: checked }))}
            />
            <ToggleRow
              label={t("profile.notifications.dailyHealth")}
              checked={healthForm.notifyDailyHealth}
              onChange={(checked) => setHealthForm((c) => ({ ...c, notifyDailyHealth: checked }))}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("profile.form.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label={t("profile.form.nutritionalNeeds")}>
              <Textarea
                value={healthForm.nutritionalNeeds}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, nutritionalNeeds: event.target.value }))
                }
              />
            </Field>
            <Field label={t("profile.form.healthRisks")}>
              <Textarea
                value={healthForm.healthRisks}
                onChange={(event) =>
                  setHealthForm((c) => ({ ...c, healthRisks: event.target.value }))
                }
              />
            </Field>
            <Button type="submit" disabled={savingHealth} className="rounded-full">
              {savingHealth ? t("common.saving") : t("profile.form.save")}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="mt-6 rounded-3xl border-destructive/30">
        <CardHeader>
          <CardTitle>{t("profile.delete.title")}</CardTitle>
          <CardDescription>{t("profile.delete.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="rounded-full" onClick={() => setDeleteOpen(true)}>
            {t("profile.delete.button")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.delete.dialogTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("profile.delete.dialogDescription")}</p>
          <Field label={t("profile.delete.passwordLabel")}>
            <Input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void confirmDeleteAccount()}>
              {deleting ? t("profile.delete.deleting") : t("profile.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
