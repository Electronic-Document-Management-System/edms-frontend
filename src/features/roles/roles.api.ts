import { apiClient } from "@/lib/api-client";
import { Role, RoleImpact, RolePermissionsResponse } from "./roles.types";

const BASE = "/rbac";

export const getRoles = async (): Promise<Role[]> => {
    const res = await apiClient<{ data: { roles: Role[] } }>(`${BASE}/roles`);
    return res.data.roles;
};

export const getRoleById = async (roleId: number): Promise<Role> => {
    const res = await apiClient<{ data: { role: Role } }>(`${BASE}/roles/${roleId}`);
    return res.data.role;
};

export const getRolePermissions = async (roleId: number): Promise<RolePermissionsResponse> => {
    const res = await apiClient<{ data: { rolePermissions: RolePermissionsResponse } }>(
        `${BASE}/roles/${roleId}/permissions`
    );
    return res.data.rolePermissions;
};

export const getRoleImpact = async (roleId: number): Promise<RoleImpact> => {
    const res = await apiClient<{ data: { roleImpact: RoleImpact } }>(
        `${BASE}/roles/${roleId}/impact`
    );
    return res.data.roleImpact;
};

export const createRole = async (data: { name: string }): Promise<Role> => {
    const res = await apiClient<{ data: { role: Role } }>(`${BASE}/roles`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.data.role;
};

export const updateRole = async (roleId: number, data: { name: string }): Promise<Role> => {
    const res = await apiClient<{ data: { role: Role } }>(`${BASE}/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return res.data.role;
};

export const deleteRole = async (roleId: number): Promise<Role> => {
    const res = await apiClient<{ data: { role: Role } }>(`${BASE}/roles/${roleId}`, {
        method: "DELETE",
    });
    return res.data.role;
};

export const addPermissionToRole = async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient(`${BASE}/roles/${roleId}/permissions`, {
        method: "POST",
        body: JSON.stringify({ permissionId }),
    });
};

export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient(`${BASE}/roles/${roleId}/permissions/${permissionId}`, {
        method: "DELETE",
    });
};