"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePermission } from "@/hooks/usePermission";

type PermissionGuardProps = {
  permissions: string[];
  children: ReactNode;
};

export function PermissionGuard({
  permissions,
  children,
}: PermissionGuardProps) {
  const router = useRouter();
  const { canAny } = usePermission();

  const isAllowed = canAny(permissions);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/unauthorized");
    }
  }, [isAllowed, router]);

  if (!isAllowed) return null;

  return <>{children}</>;
}