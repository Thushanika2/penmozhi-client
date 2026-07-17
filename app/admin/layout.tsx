import { AuthenticatedRoute } from "@/components/auth-guard"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <AdminSidebar>{children}</AdminSidebar>
    </AuthenticatedRoute>
  )
}
