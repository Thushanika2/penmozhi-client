import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { EducationListView } from "@/sections/education/view/education-list-view"

export default function EducationPage() {
  return (
    <div className="min-h-svh gradient-mesh">
      <header className="sticky top-0 z-50 border-b border-border/50 glass-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" render={<Link href="/" />}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Learn
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
            Educational Resources
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Trusted articles on women&apos;s health and wellness
          </p>
        </div>
        <EducationListView publicMode />
      </div>
    </div>
  )
}
