"use client";

import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
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

import { getRoles } from "@/features/roles/roles.api";
import { Role } from "@/features/roles/roles.types";

import { assignRoleToUser, getUserRoles, removeRoleFromUser } from "@/features/users/users.api";
import { User, UserWithRoles } from "@/features/users/users.types";

type UserRolesDialogProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
  const [userRoles, setUserRoles] = useState<UserWithRoles | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, userRolesData] = await Promise.all([
        getRoles(),
        getUserRoles(user.id),
      ]);
      setAllRoles(rolesData);
      setUserRoles(userRolesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const assignedRoleIds = new Set(userRoles?.roles.map((r) => r.role_id) ?? []);
  const availableRoles = allRoles.filter((r) => !assignedRoleIds.has(r.id));

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role to assign.");
      return;
    }

    try {
      setIsAssigning(true);
      await assignRoleToUser(user.id, Number(selectedRoleId));
      toast.success("Role assigned successfully.");
      setSelectedRoleId("");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign role.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (roleId: number) => {
    try {
      setRemovingRoleId(roleId);
      await removeRoleFromUser(user.id, roleId);
      toast.success("Role removed successfully.");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove role.");
    } finally {
      setRemovingRoleId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage roles — {user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a role to assign" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAssign} disabled={isAssigning || !selectedRoleId}>
              <UserPlus className="mr-2 h-4 w-4" />
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Assigned roles</p>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : userRoles?.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {userRoles?.roles.map((userRole) => (
                  <div
                    key={userRole.role_id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <Badge variant="outline">{userRole.role.name}</Badge>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemove(userRole.role_id)}
                      disabled={removingRoleId === userRole.role_id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}