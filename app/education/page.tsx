import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { EducationListView } from "@/sections/education/view/education-list-view"

export default function EducationPage() {
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="Educational Resources"
          description="Trusted articles on women's health and wellness"
        />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" render={<Link href="/" />}>
            Home
          </Button>
        </div>
      </div>
      <EducationListView publicMode />
    </div>
  )
}
