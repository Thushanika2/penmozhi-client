import { AuthenticatedRoute } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <DashboardSidebar>{children}</DashboardSidebar>
    </AuthenticatedRoute>
  )
}
