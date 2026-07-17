import Link from "next/link"

import { Button } from "@/components/ui/button"
import { EducationDetailView } from "@/sections/education/view/education-detail-view"

export default async function EducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="mx-auto min-h-svh max-w-4xl px-4 py-8">
      <Button variant="outline" className="mb-6" render={<Link href="/education" />}>
        Back to articles
      </Button>
      <EducationDetailView id={Number(id)} />
    </div>
  )
}
