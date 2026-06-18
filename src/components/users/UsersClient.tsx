"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Power, PowerOff, Shield, Trash2, UserCog } from "lucide-react";
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

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import {
  activateUser,
  createNewUser,
  disableUser,
  getAllUsers,
  updateUserById,
} from "@/features/users/users.api";
import { User } from "@/features/users/users.types";

import { UserRolesDialog } from "./UserRolesDialog";

export function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dept_id: "",
  });

  // Status toggle confirm
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Roles management dialog
  const [rolesDialogUser, setRolesDialogUser] = useState<User | null>(null);

  const departmentMap = useMemo(() => {
    return new Map(departments.map((d) => [d.id, d.name]));
  }, [departments]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, departmentsData] = await Promise.all([
        getAllUsers(),
        getDepartments(),
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateDialog = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", dept_id: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      dept_id: String(user.dept_id),
    });
    setDialogOpen(true);
  };

  const openStatusDialog = (user: User) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.dept_id) {
      toast.error("Name, email and department are required.");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      toast.error("Password is required for new users.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingUser) {
        const updated = await updateUserById(editingUser.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          dept_id: Number(form.dept_id),
        });
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        toast.success("User updated successfully.");
      } else {
        const created = await createNewUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          dept_id: Number(form.dept_id),
        });
        setUsers((prev) => [...prev, created]);
        toast.success("User created successfully.");
      }

      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedUser) return;

    try {
      setIsToggling(true);

      const updated = selectedUser.isActive
        ? await disableUser(selectedUser.id)
        : await activateUser(selectedUser.id);

      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setStatusDialogOpen(false);
      setSelectedUser(null);

      toast.success(
        updated.isActive ? "User activated successfully." : "User disabled successfully."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status.");
      setStatusDialogOpen(false);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage system users, their departments and role assignments.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">#{user.id}</TableCell>

                    <TableCell className="font-medium">{user.name}</TableCell>

                    <TableCell className="text-muted-foreground">{user.email}</TableCell>

                    <TableCell>
                      {departmentMap.get(user.dept_id) ?? `Dept #${user.dept_id}`}
                    </TableCell>

                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ActionTooltip
                          label="Manage roles"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setRolesDialogUser(user)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Edit user"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label={user.isActive ? "Disable user" : "Activate user"}
                          tooltipClassName={
                            user.isActive ? "bg-red-600 text-white" : "bg-green-600 text-white"
                          }
                          arrowClassName={user.isActive ? "fill-red-600" : "fill-green-600"}
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openStatusDialog(user)}
                          >
                            {user.isActive ? (
                              <PowerOff className="h-4 w-4 text-red-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No users found.
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
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. john@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Set an initial password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dept">Department</Label>
              <Select
                value={form.dept_id}
                onValueChange={(val) => setForm((f) => ({ ...f, dept_id: val }))}
              >
                <SelectTrigger id="dept">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? editingUser ? "Updating..." : "Creating..."
                  : editingUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirm */}
      <ConfirmActionDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        isLoading={isToggling}
        variant={selectedUser?.isActive ? "destructive" : "default"}
        title={selectedUser?.isActive ? "Disable user?" : "Activate user?"}
        description={
          selectedUser?.isActive
            ? `${selectedUser?.name} will lose access to the system immediately.`
            : `${selectedUser?.name} will regain access to the system.`
        }
        confirmText={selectedUser?.isActive ? "Disable" : "Activate"}
        loadingText="Processing..."
        onConfirm={handleConfirmStatusToggle}
      />

      {/* Roles Management Dialog */}
      {rolesDialogUser && (
        <UserRolesDialog
          user={rolesDialogUser}
          open={!!rolesDialogUser}
          onOpenChange={(open) => !open && setRolesDialogUser(null)}
        />
      )}
    </div>
  );
}