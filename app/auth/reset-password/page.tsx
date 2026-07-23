"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
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

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </GuestRoute>
  )
}

function ResetPasswordForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get("token") ?? ""

  const schema = useMemo(
    () =>
      z
        .object({
          token: z.string().min(10, t("auth.validation.tokenRequired")),
          password: z.string().min(6, t("auth.validation.passwordMin")),
          confirmPassword: z.string().min(6, t("auth.validation.passwordMin")),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("auth.validation.passwordMismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  )
  type FormValues = z.infer<typeof schema>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: tokenFromUrl },
  })

  async function onSubmit(values: FormValues) {
    try {
      await authService.resetPassword(values.token, values.password)
      toast.success(t("auth.resetPassword.success"))
      router.push("/auth/login")
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <AuthShell>
      <Card className="glass-panel w-full rounded-3xl border-border/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{t("auth.resetPassword.title")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">{t("auth.resetPassword.token")}</Label>
              <Input id="token" className="rounded-xl" {...register("token")} />
              {errors.token ? <p className="text-sm text-destructive">{errors.token.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.resetPassword.password")}</Label>
              <Input id="password" type="password" className="rounded-xl" {...register("password")} />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="rounded-xl"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
            </Button>
            <Link href="/auth/login" className="text-sm text-primary underline">
              {t("auth.resetPassword.backToLogin")}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}
