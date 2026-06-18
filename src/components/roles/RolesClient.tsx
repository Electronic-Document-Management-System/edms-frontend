"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createRole,
  deleteRole,
  getRoleImpact,
  getRoles,
  updateRole,
} from "@/features/roles/roles.api";
import { Role, RoleImpact } from "@/features/roles/roles.types";
import { RolePermissionsDialog } from "./RolePermissionsDialog";

export function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleImpact, setRoleImpact] = useState<RoleImpact | null>(null);

  const [permissionsDialogRole, setPermissionsDialogRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await getRoles();
      setRoles(data as Role[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateDialog = () => {
    setEditingRole(null);
    setRoleName("");
    setDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setDialogOpen(true);
  };

  const openDeleteDialog = async (role: Role) => {
    setSelectedRole(role);
    try {
      const impact = await getRoleImpact(role.id);
      setRoleImpact(impact);
    } catch {
      setRoleImpact(null);
    }
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingRole) {
        const updated = await updateRole(editingRole.id, { name: roleName.trim() });
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? updated : r))
        );
        toast.success("Role updated successfully.");
      } else {
        const created = await createRole({ name: roleName.trim() });
        setRoles((prev) => [...prev, created]);
        toast.success("Role created successfully.");
      }

      setDialogOpen(false);
      setRoleName("");
      setEditingRole(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    try {
      setIsDeleting(true);
      await deleteRole(selectedRole.id);
      setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      toast.success("Role deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role.");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
          <p className="text-muted-foreground">
            Manage system roles and their assignments.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading roles...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-muted-foreground">
                      #{role.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ActionTooltip
                          label="Manage permissions"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setPermissionsDialogRole(role)}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip
                          label="Edit role"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditDialog(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Delete role"
                          tooltipClassName="bg-red-600 text-white"
                          arrowClassName="fill-red-600"
                        >
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => openDeleteDialog(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {roles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Manager, Reviewer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? editingRole ? "Updating..." : "Creating..."
                  : editingRole ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title={`Delete "${selectedRole?.name}"?`}
        description={
          roleImpact
            ? `This role is assigned to ${roleImpact.users} user(s) and has ${roleImpact.permissions} permission(s). Deleting it will remove all associations.`
            : "This action cannot be undone."
        }
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />
      {permissionsDialogRole && (
        <RolePermissionsDialog
          role={permissionsDialogRole}
          open={!!permissionsDialogRole}
          onOpenChange={(open) => !open && setPermissionsDialogRole(null)}
        />
      )}
    </div>
  );
}