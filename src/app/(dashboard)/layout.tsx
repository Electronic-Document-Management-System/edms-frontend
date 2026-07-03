import { AuthGuard } from "@/components/auth/AuthGuard";
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
          <AuthGuard>
            <div className="p-6">{children}</div>
          </AuthGuard>
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}