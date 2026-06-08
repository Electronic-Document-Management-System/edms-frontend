"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderInput, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createFolder,
  deleteFolder,
  getFolders,
  updateFolder,
  moveFolder
} from "@/features/folder/folder.api";
import { Folder } from "@/features/folder/folder.types";

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionTooltip } from "../common/ActionTooltip";

export function FolderClient() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deptId, setDeptId] = useState("");
  const [parentId, setParentId] = useState<string>("none");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState<Folder | null>(null);
  const [moveParentId, setMoveParentId] = useState<string>("none");
  const [isMoving, setIsMoving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const departmentMap = useMemo(() => {
    return new Map(
      departments.map((department) => [department.id, department.name]),
    );
  }, [departments]);

  const folderMap = useMemo(() => {
    return new Map(folders.map((folder) => [folder.id, folder.name]));
  }, [folders]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [foldersData, departmentsData] = await Promise.all([
        getFolders(),
        getDepartments(),
      ]);

      setFolders(foldersData);
      setDepartments(departmentsData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load folders.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDeptId("");
    setParentId("none");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Folder name is required.");
      return;
    }

    if (!deptId) {
      toast.error("Please select a department.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        name,
        description,
        dept_id: Number(deptId),
        parent_id: parentId === "none" ? null : Number(parentId),
      };

      if (editingId) {
        const updatedFolder = await updateFolder(editingId, payload);

        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === editingId ? updatedFolder : folder,
          ),
        );

        resetForm();
        toast.success("Folder updated successfully.");
        return;
      }

      const newFolder = await createFolder(payload);

      setFolders((prev) => [newFolder, ...prev]);
      resetForm();
      toast.success("Folder created successfully.");

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Folder action failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (folder: Folder) => {
    setError("");
    setEditingId(folder.id);
    setName(folder.name);
    setDescription(folder.description ?? "");
    setDeptId(String(folder.dept_id));
    setParentId(folder.parent_id ? String(folder.parent_id) : "none");
  };

  const openDeleteDialog = (folderId: number) => {
    setError("");
    setSelectedFolderId(folderId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFolderId) return;

    try {
      setIsDeleting(true);
      setError("");

      await deleteFolder(selectedFolderId);

      setFolders((prev) =>
        prev.filter((folder) => folder.id !== selectedFolderId),
      );

      setDeleteDialogOpen(false);
      setSelectedFolderId(null);

      toast.success("Folder deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete folder.";

      setDeleteDialogOpen(false);
      setSelectedFolderId(null);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openMoveDialog = (folder: Folder) => {
    setError("");
    setSelectedMoveFolder(folder);
    setMoveParentId(folder.parent_id ? String(folder.parent_id) : "none");
    setMoveDialogOpen(true);
  };


  const availableParentFolders = folders.filter((folder) => {
    if (editingId && folder.id === editingId) return false;
    if (!deptId) return true;

    return folder.dept_id === Number(deptId);
  });

  const availableMoveParentFolders = folders.filter((folder) => {
    if (!selectedMoveFolder) return false;

    if (folder.id === selectedMoveFolder.id) return false;

    return folder.dept_id === selectedMoveFolder.dept_id;
  });

  const handleConfirmMove = async () => {
    if (!selectedMoveFolder) return;

    try {
      setIsMoving(true);
      setError("");

      const newParentId =
        moveParentId === "none" ? null : Number(moveParentId);

      if (newParentId === selectedMoveFolder.id) {
        toast.error("A folder cannot be moved inside itself.");
        return;
      }

      const updatedFolder = await moveFolder(selectedMoveFolder.id, {
        parent_id: newParentId,
      });

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === selectedMoveFolder.id ? updatedFolder : folder,
        ),
      );

      setMoveDialogOpen(false);
      setSelectedMoveFolder(null);
      setMoveParentId("none");

      toast.success("Folder moved successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to move folder.";

      setMoveDialogOpen(false);
      setSelectedMoveFolder(null);
      setMoveParentId("none");

      setError(message);
      toast.error(message);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Folder Management
        </h2>
        <p className="text-muted-foreground">
          Create and manage department-wise folders.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Update Folder" : "Create Folder"}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Parent folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent folder</SelectItem>

                {availableParentFolders.map((folder) => (
                  <SelectItem key={folder.id} value={String(folder.id)}>
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">📁</span>
                      {folder.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Folders</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading folders...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Folder</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Parent Folder</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {folders.map((folder) => (
                  <TableRow key={folder.id}>
                    <TableCell>{folder.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-xl leading-none">📁</span>
                        <span>{folder.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {departmentMap.get(folder.dept_id) ??
                        `Department #${folder.dept_id}`}
                    </TableCell>
                    <TableCell>
                      {folder.parent_id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">📁</span>
                          <span>
                            {folderMap.get(folder.parent_id) ?? `Folder #${folder.parent_id}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Root Folder</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {folder.description ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <div className="flex justify-end gap-2">
                          <ActionTooltip label="Edit folder" tooltipClassName="bg-slate-900 text-white" arrowClassName="fill-slate-900">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEdit(folder)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>

                          <ActionTooltip label="Move folder" 
                            tooltipClassName="bg-blue-600 text-white"
                            arrowClassName="fill-blue-600"
                          >
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openMoveDialog(folder)}
                            >
                              <FolderInput className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>

                          <ActionTooltip label="Delete folder" tooltipClassName="bg-red-600 text-white" arrowClassName="fill-red-600">
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => openDeleteDialog(folder.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {folders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No folders found.
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
        title="Delete folder?"
        description="This folder will be deleted only if it has no child folders or documents. This action may affect document organization."
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move folder</DialogTitle>
            <DialogDescription>
              Select a new parent folder for{" "}
              <span className="font-medium text-foreground">
                {selectedMoveFolder?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="text-sm font-medium">New parent folder</label>

            <Select value={moveParentId} onValueChange={setMoveParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent folder" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">Root Folder</SelectItem>

                {availableMoveParentFolders.map((folder) => (
                  <SelectItem key={folder.id} value={String(folder.id)}>
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">📁</span>
                      {folder.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Folders can be moved within the same department.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isMoving}
              onClick={() => setMoveDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button disabled={isMoving} onClick={handleConfirmMove}>
              {isMoving ? "Moving..." : "Move Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}