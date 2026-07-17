import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { EducationListView } from "@/sections/education/view/education-list-view"

export default function AdminEducationPage() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader
          title="Manage Education"
          description="Create, edit, and publish health articles"
        />
        <Button render={<Link href="/admin/education/new" />}>New article</Button>
      </div>
      <EducationListView adminMode />
    </div>
  )
}
