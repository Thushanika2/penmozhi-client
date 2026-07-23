"use client"

import { AuthenticatedRoute } from "@/components/auth-guard"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { BrandLogo } from "@/components/brand-logo"

export default function OnboardingPage() {
  return (
    <AuthenticatedRoute onboardingOnly>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <header className="flex justify-center py-6">
          <BrandLogo href="/" size="md" />
        </header>
        <OnboardingWizard />
      </div>
    </AuthenticatedRoute>
  )
}
