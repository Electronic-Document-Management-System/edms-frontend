import { apiClient } from "@/lib/api-client";
import { Permission } from "./permission.types";

const BASE = "/rbac";

export const getPermissions = async (): Promise<Permission[]> => {
    const res = await apiClient<{ data: { permissions: Permission[] } }>(`${BASE}/permissions`);
    return res.data.permissions;
};

export const createPermission = async (data: {
    resource: string;
    action: string;
    scope: string;
}): Promise<Permission> => {
    const res = await apiClient<{ data: { permission: Permission } }>(`${BASE}/permissions`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.data.permission;
};

export const updatePermission = async (
    permissionId: number,
    data: { resource: string; action: string; scope: string }
): Promise<Permission> => {
    const res = await apiClient<{ data: { permission: Permission } }>(
        `${BASE}/permissions/${permissionId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );
    return res.data.permission;
};

export const deletePermission = async (permissionId: number): Promise<void> => {
    await apiClient(`${BASE}/permissions/${permissionId}`, {
        method: "DELETE",
    });
};