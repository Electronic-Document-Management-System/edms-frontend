import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/permissions.helper";
import useAuthStore from "@/store/authStore";

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const permissions = user?.permissions ?? [];

  const can = (permission: string) => {
    return hasPermission(permissions, permission);
  };

  const canAny = (requiredPermissions: string[]) => {
    return hasAnyPermission(permissions, requiredPermissions);
  };

  const canAll = (requiredPermissions: string[]) => {
    return hasAllPermissions(permissions, requiredPermissions);
  };

  return {
    permissions,
    can,
    canAny,
    canAll,
  };
}