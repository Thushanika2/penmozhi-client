"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Select } from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAuth } from "@/providers/auth-provider"

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  languagePreference: z.enum(["english", "tamil"]),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  )
}

function RegisterForm() {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { languagePreference: "english" },
  })

  async function onSubmit(values: FormValues) {
    try {
      await registerUser({
        full_name: values.fullName,
        email: values.email,
        password: values.password,
        date_of_birth: values.dateOfBirth,
        language_preference: values.languagePreference,
      })
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <AuthShell>
      <Card className="glass-panel w-full rounded-3xl border-border/60 shadow-2xl shadow-primary/10">
        <CardHeader className="space-y-4">
          <div className="lg:hidden">
            <BrandLogo href="/" size="md" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start tracking your health with Penmozhi
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" className="rounded-xl" {...register("fullName")} />
              {errors.fullName ? (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="rounded-xl" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="rounded-xl"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="rounded-xl"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth ? (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="languagePreference">Language</Label>
              <Select
                id="languagePreference"
                className="rounded-xl"
                {...register("languagePreference")}
              >
                <option value="english">English</option>
                <option value="tamil">Tamil (தமிழ்)</option>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  )
}
