"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

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
import { getApiErrorMessage } from "@/lib/api-client"
import {
  getHealthProfileRisks,
  updateHealthProfile,
} from "@/services/health-profile"
import { useAuth } from "@/providers/auth-provider"
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
  const [risks, setRisks] = React.useState<HealthProfileRisks | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>()

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
        toast.error(getApiErrorMessage(error))
      }
    }
    loadRisks()
  }, [healthProfile, reset])

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
      toast.success("Profile updated")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your account and health profile details"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {user?.full_name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {user?.email}
            </p>
            <p>
              <span className="text-muted-foreground">Language:</span>{" "}
              <Badge variant="secondary">{user?.language_preference}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Date of birth:</span>{" "}
              {user?.date_of_birth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health risks summary</CardTitle>
            <CardDescription>Calculated from your health profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              BMI:{" "}
              <strong>{risks?.calculated_bmi?.toFixed(1) ?? "—"}</strong>{" "}
              {risks?.bmi_category ? `(${risks.bmi_category})` : ""}
            </p>
            <p>Nutritional needs: {risks?.nutritional_needs ?? "Not set"}</p>
            <p>Health risks: {risks?.health_risks ?? "Not set"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Health profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" {...register("weight", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" step="0.1" {...register("height", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Nutritional needs</Label>
              <Textarea {...register("nutritionalNeeds")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Health risks</Label>
              <Textarea {...register("healthRisks")} />
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
