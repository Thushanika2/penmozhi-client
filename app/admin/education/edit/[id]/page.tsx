import Link from "next/link"

import { Button } from "@/components/ui/button"
import { EducationEditView } from "@/sections/education/view/education-edit-view"

export default async function AdminEducationEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <Button variant="outline" className="mb-4" render={<Link href="/admin/education" />}>
        Back
      </Button>
      <EducationEditView id={Number(id)} />
    </div>
  )
}
