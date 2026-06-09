"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmActionDialog } from "../common/ConfirmActionDialog";
import { toast } from "sonner";

export function DepartmentsClient() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load departments.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");

      if (editingId) {
        const updatedDepartment = await updateDepartment(editingId, { name });

        setDepartments((prev) =>
          prev.map((department) =>
            department.id === editingId ? updatedDepartment : department,
          ),
        );

        resetForm();
        toast.success("Department updated successfully.");
        return;
      }

      const newDepartment = await createDepartment({ name });

      setDepartments((prev) => [newDepartment, ...prev]);
      resetForm();
      toast.success("Department created successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Department action failed.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setError("");
    setEditingId(department.id);
    setName(department.name);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartmentId) return;

    try {
      setIsDeleting(true);
      setError("");

      await deleteDepartment(selectedDepartmentId);

      setDepartments((prev) =>
        prev.filter((department) => department.id !== selectedDepartmentId),
      );

      setDeleteDialogOpen(false);
      setSelectedDepartmentId(null);

      toast.success("Department deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete department.";

      setDeleteDialogOpen(false);
      setSelectedDepartmentId(null);

      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (departmentId: number) => {
    setError("");
    setSelectedDepartmentId(departmentId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Department Management
        </h2>
        <p className="text-muted-foreground">
          Create and manage organizational departments.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Update Department" : "Create Department"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Department name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update"
                    : "Create"}
              </Button>

              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading departments...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Parent ID</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.id}</TableCell>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell>
                      {department.parent_id ?? "Root Department"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            openDeleteDialog(department.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {departments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No departments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title="Delete department?"
        description="This department can only be deleted if it has no assigned users, folders, or documents."
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}