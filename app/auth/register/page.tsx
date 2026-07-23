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
import { Select } from "@/components/ui/select"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { emailField, fullNameField, passwordField } from "@/lib/validation/auth"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/language-provider"

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  )
}

function RegisterForm() {
  const { register: registerUser } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const schema = useMemo(
    () =>
      z.object({
        fullName: fullNameField(t),
        email: emailField(t),
        password: passwordField(t),
        languagePreference: z.enum(["english", "tamil"]),
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
    defaultValues: { languagePreference: "english" },
  })

  async function onSubmit(values: FormValues) {
    try {
      await registerUser({
        full_name: values.fullName,
        email: values.email,
        password: values.password,
        language_preference: values.languagePreference,
      })
      toast.success(t("auth.register.accountCreated"))
      router.push("/onboarding")
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    }
  }

  return (
    <AuthShell>
      <Card className="glass-panel w-full rounded-3xl border-border/60 shadow-2xl shadow-primary/10">
        <CardHeader className="space-y-4">
          <div className="lg:hidden">
            <BrandLogo href="/" size="md" />
          </div>
          <CardTitle className="font-heading text-2xl">{t("auth.register.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("auth.register.subtitle")}</p>
        </CardHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.register.fullName")}</Label>
              <Input
                id="fullName"
                autoComplete="name"
                className="rounded-xl"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
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
              <Label htmlFor="password">{t("auth.register.password")}</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="languagePreference">{t("auth.register.language")}</Label>
              <Select
                id="languagePreference"
                className="rounded-xl"
                {...register("languagePreference")}
              >
                <option value="english">{t("auth.register.languageEnglish")}</option>
                <option value="tamil">{t("auth.register.languageTamil")}</option>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("auth.register.alreadyHaveAccount")}{" "}
              <Link href="/auth/login" className="font-medium text-primary underline">
                {t("auth.register.signInLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}
