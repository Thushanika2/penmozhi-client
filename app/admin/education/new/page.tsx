import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { EducationFormView } from "@/sections/education/education-new-edit-form"

export default function AdminEducationNewPage() {
  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/admin/education" />}>
        Back
      </Button>
      <PageHeader title="New article" description="Publish a new educational resource" />
      <EducationFormView />
    </div>
  )
}
