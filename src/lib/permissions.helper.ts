export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string,
) {
  if (!userPermissions) return false;

  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: string[],
) {
  if (!userPermissions) return false;

  return permissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: string[],
) {
  if (!userPermissions) return false;

  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
}