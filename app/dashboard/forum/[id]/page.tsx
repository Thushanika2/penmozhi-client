import { ForumDetailView } from "@/sections/forum/view/forum-detail-view"

export default async function ForumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ForumDetailView id={Number(id)} />
}
