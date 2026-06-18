"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createPermission,
  deletePermission,
  getPermissions,
  updatePermission,
} from "@/features/permissions/permissions.api";
import { Permission } from "@/features/permissions/permission.types";

const SCOPES = ["own", "department", "assigned", "shared", "all"] as const;

const scopeVariant: Record<string, "default" | "secondary" | "outline"> = {
  all: "default",
  department: "secondary",
  own: "outline",
  assigned: "outline",
  shared: "outline",
};

export function PermissionsClient() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resourceFilter, setResourceFilter] = useState("all");

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form, setForm] = useState({ resource: "", action: "", scope: "" });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Unique resources for filter dropdown
  const resources = useMemo(() => {
    return [...new Set(permissions.map((p) => p.resource))].sort();
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    if (resourceFilter === "all") return permissions;
    return permissions.filter((p) => p.resource === resourceFilter);
  }, [permissions, resourceFilter]);

  // Group by resource for display
  const grouped = useMemo(() => {
    return filteredPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = [];
      acc[p.resource].push(p);
      return acc;
    }, {});
  }, [filteredPermissions]);

  const openCreateDialog = () => {
    setEditingPermission(null);
    setForm({ resource: "", action: "", scope: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setForm({
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.resource.trim() || !form.action.trim() || !form.scope) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingPermission) {
        const updated = await updatePermission(editingPermission.id, form);
        setPermissions((prev) =>
          prev.map((p) => (p.id === editingPermission.id ? updated : p))
        );
        toast.success("Permission updated successfully.");
      } else {
        const created = await createPermission(form);
        setPermissions((prev) => [...prev, created]);
        toast.success("Permission created successfully.");
      }

      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPermission) return;

    try {
      setIsDeleting(true);
      await deletePermission(selectedPermission.id);
      setPermissions((prev) => prev.filter((p) => p.id !== selectedPermission.id));
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
      toast.success("Permission deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete permission.");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Permissions</h2>
          <p className="text-muted-foreground">
            Manage system permissions grouped by resource.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Permission
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by resource" />
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
        </CardContent>
      </Card>

      {/* Grouped Tables */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading permissions...</p>
      ) : (
        Object.entries(grouped).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <CardTitle className="capitalize">{resource}</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Permission String</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {perms.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="text-muted-foreground">
                        #{permission.id}
                      </TableCell>

                      <TableCell className="font-medium capitalize">
                        {permission.action}
                      </TableCell>

                      <TableCell>
                        <Badge variant={scopeVariant[permission.scope] ?? "outline"}>
                          {permission.scope}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {permission.resource}:{permission.action}:{permission.scope}
                        </code>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <ActionTooltip
                            label="Edit permission"
                            tooltipClassName="bg-slate-900 text-white"
                            arrowClassName="fill-slate-900"
                          >
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openEditDialog(permission)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>

                          <ActionTooltip
                            label="Delete permission"
                            tooltipClassName="bg-red-600 text-white"
                            arrowClassName="fill-red-600"
                          >
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => openDeleteDialog(permission)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? "Edit Permission" : "Create New Permission"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <Input
                id="resource"
                placeholder="e.g. document, folder, role"
                value={form.resource}
                onChange={(e) => setForm((f) => ({ ...f, resource: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g. read, create, delete"
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={form.scope}
                onValueChange={(val) => setForm((f) => ({ ...f, scope: val }))}
              >
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  ? editingPermission ? "Updating..." : "Creating..."
                  : editingPermission ? "Update" : "Create Permission"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title="Delete permission?"
        description={
          selectedPermission
            ? `"${selectedPermission.resource}:${selectedPermission.action}:${selectedPermission.scope}" will be permanently removed from the system and any roles that have it.`
            : "This action cannot be undone."
        }
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}