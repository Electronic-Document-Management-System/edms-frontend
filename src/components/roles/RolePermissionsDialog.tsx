"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getPermissions } from "@/features/permissions/permissions.api";
import { Permission } from "@/features/permissions/permission.types";

import {
  addPermissionToRole,
  getRolePermissions,
  removePermissionFromRole,
} from "@/features/roles/roles.api";
import { Role, RolePermission } from "@/features/roles/roles.types";

type RolePermissionsDialogProps = {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RolePermissionsDialog({
  role,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removingPermissionId, setRemovingPermissionId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [permissionsData, rolePermissionsData] = await Promise.all([
        getPermissions(),
        getRolePermissions(role.id),
      ]);
      setAllPermissions(permissionsData);
      setRolePermissions(rolePermissionsData.rolePermissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
      setSelectedPermissionId("");
      setResourceFilter("all");
    }
  }, [open]);

  const assignedPermissionIds = useMemo(
    () => new Set(rolePermissions.map((rp) => rp.permission_id)),
    [rolePermissions]
  );

  const availablePermissions = useMemo(
    () => allPermissions.filter((p) => !assignedPermissionIds.has(p.id)),
    [allPermissions, assignedPermissionIds]
  );

  const resources = useMemo(
    () => [...new Set(availablePermissions.map((p) => p.resource))].sort(),
    [availablePermissions]
  );

  const filteredAvailable = useMemo(() => {
    if (resourceFilter === "all") return availablePermissions;
    return availablePermissions.filter((p) => p.resource === resourceFilter);
  }, [availablePermissions, resourceFilter]);

  // Group assigned permissions by resource for clean display
  const groupedAssigned = useMemo(() => {
    return rolePermissions.reduce<Record<string, RolePermission[]>>((acc, rp) => {
      const resource = rp.permission.resource;
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push(rp);
      return acc;
    }, {});
  }, [rolePermissions]);

  const handleAssign = async () => {
    if (!selectedPermissionId) {
      toast.error("Please select a permission to assign.");
      return;
    }

    try {
      setIsAssigning(true);
      await addPermissionToRole(role.id, Number(selectedPermissionId));
      toast.success("Permission assigned successfully.");
      setSelectedPermissionId("");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign permission.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (permissionId: number) => {
    try {
      setRemovingPermissionId(permissionId);
      await removePermissionFromRole(role.id, permissionId);
      toast.success("Permission removed successfully.");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove permission.");
    } finally {
      setRemovingPermissionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage permissions — {role.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Assign new permission */}
          <div className="flex gap-2">
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                {resources.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPermissionId} onValueChange={setSelectedPermissionId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a permission to assign" />
              </SelectTrigger>
              <SelectContent>
                {filteredAvailable.map((permission) => (
                  <SelectItem key={permission.id} value={String(permission.id)}>
                    {permission.resource}:{permission.action}:{permission.scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAssign} disabled={isAssigning || !selectedPermissionId}>
              <ShieldPlus className="mr-2 h-4 w-4" />
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </div>

          {/* Assigned permissions list */}
          <div className="max-h-[400px] space-y-4 overflow-y-auto">
            <p className="text-sm font-medium text-muted-foreground">
              Assigned permissions ({rolePermissions.length})
            </p>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : rolePermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No permissions assigned yet.</p>
            ) : (
              Object.entries(groupedAssigned).map(([resource, perms]) => (
                <div key={resource} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {resource}
                  </p>

                  <div className="space-y-1.5">
                    {perms.map((rp) => (
                      <div
                        key={rp.permission_id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <Badge variant="outline">
                          {rp.permission.action}:{rp.permission.scope}
                        </Badge>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemove(rp.permission_id)}
                          disabled={removingPermissionId === rp.permission_id}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}