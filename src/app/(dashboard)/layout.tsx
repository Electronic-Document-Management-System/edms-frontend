import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <TooltipProvider>

        <AppSidebar />

        <main className="min-h-screen flex-1 bg-slate-50">
          <AppHeader />
          <PermissionGuard permissions={[]}>
            <div className="p-6">{children}</div>
          </PermissionGuard>
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}