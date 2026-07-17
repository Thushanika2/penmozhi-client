import { AuthenticatedRoute } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <DashboardSidebar>{children}</DashboardSidebar>
    </AuthenticatedRoute>
  )
}
