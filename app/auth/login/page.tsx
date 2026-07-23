"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { AuthShell } from "@/components/auth-shell"
import { GuestRoute } from "@/components/auth-guard"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { getPostAuthPath } from "@/lib/auth-redirect"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { emailField, loginPasswordField } from "@/lib/validation/auth"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const schema = useMemo(
    () =>
      z.object({
        email: emailField(t),
        password: loginPasswordField(t),
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
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  async function onSubmit(values: FormValues) {
    try {
      const user = await login(values.email, values.password)
      toast.success(t("auth.login.welcomeBack"))
      router.push(getPostAuthPath(user))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <AuthShell>
      <Card className="glass-panel rounded-3xl border-border/60 shadow-2xl shadow-primary/10">
        <CardHeader className="space-y-4">
          <div className="lg:hidden">
            <BrandLogo href="/" size="md" />
          </div>
          <CardTitle className="font-heading text-2xl">{t("auth.login.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>
        </CardHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="rounded-xl"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <p className="text-right text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-primary underline">
                {t("auth.login.forgotPassword")}
              </Link>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("auth.login.noAccount")}{" "}
              <Link href="/auth/register" className="font-medium text-primary underline">
                {t("auth.login.registerLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}
