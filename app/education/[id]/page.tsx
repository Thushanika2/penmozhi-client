import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { EducationDetailView } from "@/sections/education/view/education-detail-view"

export default async function EducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-svh gradient-mesh">
      <header className="sticky top-0 z-50 border-b border-border/50 glass-panel">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <BrandLogo size="sm" />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="outline"
          className="mb-6 rounded-full"
          render={<Link href="/education" />}
        >
          Back to articles
        </Button>
        <EducationDetailView id={Number(id)} />
      </div>
    </div>
  )
}
