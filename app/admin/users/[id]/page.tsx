"use client"

import * as React from "react"

import { AdminUserDetailView } from "@/sections/admin/view/admin-user-detail-view"

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = React.use(params)
  const userId = Number(id)

  return <AdminUserDetailView userId={userId} />
}
