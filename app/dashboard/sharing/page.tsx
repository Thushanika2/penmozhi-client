import { Suspense } from "react"

import { SharingView } from "@/sections/sharing/view/sharing-view"

export default function SharingPage() {
  return (
    <Suspense fallback={null}>
      <SharingView />
    </Suspense>
  )
}
