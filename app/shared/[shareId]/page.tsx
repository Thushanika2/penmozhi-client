import { SharedCycleView } from "@/sections/sharing/view/shared-cycle-view"

export default async function SharedCyclePage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  return <SharedCycleView shareId={Number(shareId)} />
}
