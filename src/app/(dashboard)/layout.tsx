// src/app/(dashboard)/layout.tsx

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="min-h-screen flex-1 bg-slate-50">
        <AppHeader />

        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}