import { AuthenticatedRoute } from "@/components/auth-guard"
import { AppLockGate } from "@/components/app-lock-gate"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { NotificationProvider } from "@/components/notification-provider"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <NotificationProvider>
        <AppLockGate>
          <DashboardSidebar>{children}</DashboardSidebar>
        </AppLockGate>
      </NotificationProvider>
    </AuthenticatedRoute>
  )
}
