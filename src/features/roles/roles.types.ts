export type Role = {
  id: number;
  name: string;
};

export type RoleImpact = {
  users: number;
  permissions: number;
};

export type RolePermission = {
  role_id: number;
  permission_id: number;
  permission: {
    id: number;
    resource: string;
    action: string;
    scope: string;
  };
};

export type RolePermissionsResponse = {
  id: number;
  name: string;
  rolePermissions: RolePermission[];
};