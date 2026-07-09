"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import useAuthStore from "@/store/authStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { ThemeToggle } from "../ThemeProvider/ThemeToggle";
import { NotificationBell } from "../notification/NotificationBell";

export function AppHeader() {
    const router = useRouter();

    const { logout, isLoggingOut } = useAuthStore();

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleConfirmLogout = async () => {
        const result = await logout();

        if (result.success) {
            setLogoutDialogOpen(false);
        }
    };

    return (
        <>
            <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />

                    <div>
                        <h1 className="text-lg font-semibold">
                            Enterprise Document Management System
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage departments, folders and documents
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <ThemeToggle />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogoutDialogOpen(true)}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <ConfirmActionDialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
                isLoading={isLoggingOut}
                title="Logout from EDMS?"
                description="Are you sure you want to logout? You will need to sign in again to access protected modules."
                confirmText="Logout"
                loadingText="Logging out..."
                onConfirm={handleConfirmLogout}
            />
        </>
    );
}