"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { AuthShell } from "@/components/auth-shell"
import { GuestRoute } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { useLanguage } from "@/providers/language-provider"
import * as authService from "@/services/auth"

export default function ForgotPasswordPage() {
  return (
    <GuestRoute>
      <ForgotPasswordForm />
    </GuestRoute>
  )
}

function ForgotPasswordForm() {
  const { t } = useLanguage()
  const schema = useMemo(
    () => z.object({ email: z.string().email(t("auth.validation.emailInvalid")) }),
    [t],
  )
  type FormValues = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const data = await authService.forgotPassword(values.email)
      toast.success(t("auth.forgotPassword.success"))
      if (data.reset_token) {
        toast.message(t("auth.forgotPassword.devToken", { token: data.reset_token }))
      }
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <AuthShell>
      <Card className="glass-panel w-full rounded-3xl border-border/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{t("auth.forgotPassword.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input id="email" type="email" className="rounded-xl" {...register("email")} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
            </Button>
            <Link href="/auth/login" className="text-sm text-primary underline">
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}
