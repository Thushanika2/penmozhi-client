"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { LanguageSwitcher } from "@/components/language-switcher"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import {
  getHealthProfileRisks,
  updateHealthProfile,
} from "@/services/health-profile"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"
import type { HealthProfileRisks } from "@/types/health-profile"

const schema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  nutritionalNeeds: z.string().optional(),
  healthRisks: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfileView() {
  const { user, healthProfile, setHealthProfile } = useAuth()
  const { t } = useLanguage()
  const [risks, setRisks] = React.useState<HealthProfileRisks | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => {
    if (!healthProfile) return
    reset({
      weight: healthProfile.weight ?? undefined,
      height: healthProfile.height ?? undefined,
      nutritionalNeeds: healthProfile.nutritional_needs ?? "",
      healthRisks: healthProfile.health_risks ?? "",
    })

    async function loadRisks() {
      try {
        const data = await getHealthProfileRisks(healthProfile!.id)
        setRisks(data)
      } catch (error) {
        toast.error(getLocalizedApiError(error, t))
      }
    }
    loadRisks()
  }, [healthProfile, reset, t])

  async function onSubmit(values: FormValues) {
    if (!healthProfile) return
    try {
      const data = await updateHealthProfile(healthProfile.id, {
        weight: values.weight ? Number(values.weight) : null,
        height: values.height ? Number(values.height) : null,
        nutritional_needs: values.nutritionalNeeds || null,
        health_risks: values.healthRisks || null,
      })
      setHealthProfile(data.health_profile)
      const risksData = await getHealthProfileRisks(healthProfile.id)
      setRisks(risksData)
      toast.success(t("profile.updated"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  const languageLabel =
    user?.language_preference === "tamil"
      ? t("common.tamil")
      : t("common.english")

  return (
    <div>
      <PageHeader
        title={t("profile.title")}
        description={t("profile.description")}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">
                {t("profile.account.name")}:
              </span>{" "}
              {user?.full_name}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("profile.account.email")}:
              </span>{" "}
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">
                {t("profile.account.language")}:
              </span>
              <Badge variant="secondary">{languageLabel}</Badge>
              <LanguageSwitcher />
            </div>
            <p>
              <span className="text-muted-foreground">
                {t("profile.account.dateOfBirth")}:
              </span>{" "}
              {user?.date_of_birth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.risks.title")}</CardTitle>
            <CardDescription>{t("profile.risks.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t("profile.risks.bmi")}:{" "}
              <strong>{risks?.calculated_bmi?.toFixed(1) ?? "—"}</strong>{" "}
              {risks?.bmi_category ? `(${risks.bmi_category})` : ""}
            </p>
            <p>
              {t("profile.risks.nutritionalNeeds")}:{" "}
              {risks?.nutritional_needs ?? t("common.notSet")}
            </p>
            <p>
              {t("profile.risks.healthRisks")}:{" "}
              {risks?.health_risks ?? t("common.notSet")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("profile.form.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("profile.form.weight")}</Label>
              <Input type="number" step="0.1" {...register("weight", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.form.height")}</Label>
              <Input type="number" step="0.1" {...register("height", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("profile.form.nutritionalNeeds")}</Label>
              <Textarea {...register("nutritionalNeeds")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("profile.form.healthRisks")}</Label>
              <Textarea {...register("healthRisks")} />
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.saving") : t("profile.form.save")}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
