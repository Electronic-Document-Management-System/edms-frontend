"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Eye,
  Folder as FolderIcon,
  Home,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { getFolders } from "@/features/folder/folder.api";
import { Folder } from "@/features/folder/folder.types";

import {
  archiveDocument,
  deleteDocument,
  getDocuments,
} from "@/features/document/document.api";
import { DocumentItem } from "@/features/document/document.types";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import UploadButton from "../common/UploadButton";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
export function DocumentsClient() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const { can } = usePermission();

  const canArchive = can(PERMISSIONS.DOCUMENT_ARCHIVE_OWN) ||
    can(PERMISSIONS.DOCUMENT_ARCHIVE_DEPARTMENT) ||
    can(PERMISSIONS.DOCUMENT_ARCHIVE_ALL);

  const canDelete = can(PERMISSIONS.DOCUMENT_DELETE_OWN) ||
    can(PERMISSIONS.DOCUMENT_DELETE_DEPARTMENT) ||
    can(PERMISSIONS.DOCUMENT_DELETE_ALL);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [folderId, setFolderId] = useState("all");
  const [status, setStatus] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [visibleFolders, setVisibleFolders] = useState<Folder[]>([]);

  const departmentMap = useMemo(() => {
    return new Map(
      departments.map((department) => [department.id, department.name]),
    );
  }, [departments]);

  const folderMap = useMemo(() => {
    return new Map(folders.map((folder) => [folder.id, folder.name]));
  }, [folders]);

  const filteredFolders = useMemo(() => {
    if (departmentId === "all") return folders;

    return folders.filter((folder) => folder.dept_id === Number(departmentId));
  }, [folders, departmentId]);

  const getActiveDocuments = (data: DocumentItem[]) => {
    return data.filter((document) => !document.isDeleted);
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      const [departmentsData, foldersData, documentsData] = await Promise.all([
        getDepartments(),
        getFolders(),
        getDocuments({
          page: 1,
          limit: 20,
        }),
      ]);

      setDepartments(departmentsData);
      setFolders(foldersData);
      setVisibleFolders([]);
      setDocuments(getActiveDocuments(documentsData));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load documents.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setFolderId("all");
    setCurrentFolderId(null);
    setBreadcrumbs([]);
    setVisibleFolders([]);
  }, [departmentId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      setCurrentFolderId(null);
      setBreadcrumbs([]);

      if (folderId !== "all") {
        const selectedFolder = folders.find(
          (folder) => folder.id === Number(folderId),
        );

        if (selectedFolder) {
          await loadFolderView(selectedFolder, [selectedFolder]);
          return;
        }
      }

      const selectedDepartmentId =
        departmentId === "all" ? undefined : Number(departmentId);

      const [rootFolders, documentsData] = await Promise.all([
        selectedDepartmentId
          ? getFolders({
            departmentId: selectedDepartmentId,
            parentId: null,
          })
          : Promise.resolve([]),
        getDocuments({
          search: search.trim() || undefined,
          departmentId: selectedDepartmentId,
          status: status === "all" ? undefined : status,
          page: 1,
          limit: 20,
        }),
      ]);

      setVisibleFolders(rootFolders);
      setDocuments(getActiveDocuments(documentsData));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load documents.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolderView = async (
    folder: Folder,
    nextBreadcrumbs: Folder[],
  ) => {
    try {
      setIsLoading(true);

      const [childFolders, folderDocuments] = await Promise.all([
        getFolders({
          departmentId: folder.dept_id,
          parentId: folder.id,
        }),
        getDocuments({
          search: search.trim() || undefined,
          departmentId: folder.dept_id,
          folderId: folder.id,
          status: status === "all" ? undefined : status,
          page: 1,
          limit: 20,
        }),
      ]);

      setDepartmentId(String(folder.dept_id));
      setFolderId(String(folder.id));
      setCurrentFolderId(folder.id);
      setBreadcrumbs(nextBreadcrumbs);
      setVisibleFolders(childFolders);
      setDocuments(getActiveDocuments(folderDocuments));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to open folder.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderOpen = async (folder: Folder) => {
    await loadFolderView(folder, [...breadcrumbs, folder]);
  };

  const handleDocumentFolderOpen = async (folderId: number) => {
    const folder = folders.find((item) => item.id === folderId);

    if (!folder) {
      toast.error("Folder not found.");
      return;
    }

    await loadFolderView(folder, [folder]);
  };

  const handleRootClick = async () => {
    try {
      setIsLoading(true);

      setCurrentFolderId(null);
      setBreadcrumbs([]);
      setFolderId("all");

      const selectedDepartmentId =
        departmentId === "all" ? undefined : Number(departmentId);

      const [rootFolders, documentsData] = await Promise.all([
        selectedDepartmentId
          ? getFolders({
            departmentId: selectedDepartmentId,
            parentId: null,
          })
          : Promise.resolve([]),
        getDocuments({
          search: search.trim() || undefined,
          departmentId: selectedDepartmentId,
          status: status === "all" ? undefined : status,
          page: 1,
          limit: 20,
        }),
      ]);

      setVisibleFolders(rootFolders);
      setDocuments(getActiveDocuments(documentsData));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to open repository.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreadcrumbClick = async (folder: Folder, index: number) => {
    await loadFolderView(folder, breadcrumbs.slice(0, index + 1));
  };

  const openArchiveDialog = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setArchiveDialogOpen(true);
  };

  const openDeleteDialog = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!selectedDocumentId) return;

    try {
      setIsArchiving(true);

      await archiveDocument(selectedDocumentId);

      setDocuments((prev) =>
        prev.filter((document) => document.id !== selectedDocumentId),
      );

      setArchiveDialogOpen(false);
      setSelectedDocumentId(null);

      toast.success("Document archived successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to archive document.";

      setArchiveDialogOpen(false);
      setSelectedDocumentId(null);
      toast.error(message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocumentId) return;

    try {
      setIsDeleting(true);

      await deleteDocument(selectedDocumentId);

      setDocuments((prev) =>
        prev.filter((document) => document.id !== selectedDocumentId),
      );

      setDeleteDialogOpen(false);
      setSelectedDocumentId(null);

      toast.success("Document removed successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove document.";

      setDeleteDialogOpen(false);
      setSelectedDocumentId(null);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("word")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📗";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📙";

    return "📄";
  };

  const currentDepartmentName =
    departmentId === "all"
      ? "All departments"
      : departmentMap.get(Number(departmentId)) ?? "Selected department";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Browse, search and manage repository documents.
          </p>
        </div>

        <UploadButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or description"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>

                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Folder" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>

                {filteredFolders.map((folder) => (
                  <SelectItem key={folder.id} value={String(folder.id)}>
                    📁 {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={fetchDocuments} disabled={isLoading}>
              {isLoading ? "Searching..." : "Apply Filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Repository</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-background px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {breadcrumbs.length === 0 ? (
                    <BreadcrumbPage className="inline-flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {currentDepartmentName}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={handleRootClick}
                        className="inline-flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        {currentDepartmentName}
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {breadcrumbs.map((folder, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <div key={folder.id} className="contents">
                      <BreadcrumbSeparator />

                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="inline-flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-amber-500" />
                            {folder.name}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <button
                              type="button"
                              onClick={() => handleBreadcrumbClick(folder, index)}
                              className="inline-flex items-center gap-2"
                            >
                              <FolderIcon className="h-4 w-4 text-amber-500" />
                              {folder.name}
                            </button>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {visibleFolders.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Folders
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleFolderOpen(folder)}
                    className="flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <FolderIcon className="h-5 w-5 text-amber-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{folder.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {folder.description || "Folder"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading documents...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Folder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[160px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Link
                        href={`/documents/${document.id}`}
                        className="group flex w-fit items-center gap-3 rounded-md py-1 transition hover:text-blue-600"
                      >
                        <span className="text-2xl">
                          {getFileIcon(document.mimeType)}
                        </span>

                        <div>
                          <p className="font-medium group-hover:underline">
                            {document.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {document.originalName}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      {departmentMap.get(document.dept_id) ??
                        `Department #${document.dept_id}`}
                    </TableCell>

                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleDocumentFolderOpen(document.folder_id)
                        }
                        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-amber-50 hover:text-amber-700"
                      >
                        <FolderIcon className="h-4 w-4 text-amber-500" />
                        {folderMap.get(document.folder_id) ??
                          `Folder #${document.folder_id}`}
                      </button>
                    </TableCell>

                    <TableCell>
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-medium">
                        {document.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      {(document.fileSize / 1024).toFixed(1)} KB
                    </TableCell>

                    <TableCell>
                      {new Date(document.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ActionTooltip
                          label="View details"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            className="cursor-pointer"
                            asChild
                          >
                            <Link href={`/documents/${document.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </ActionTooltip>

                        {canArchive && (
                          <ActionTooltip
                            label="Archive document"
                            tooltipClassName="bg-blue-600 text-white"
                            arrowClassName="fill-blue-600"
                          >
                            <Button
                              size="icon"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => openArchiveDialog(document.id)}
                              disabled={document.status !== "ACTIVE"}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>
                        )}

                        {canDelete && (
                          <ActionTooltip
                            label="Remove document"
                            tooltipClassName="bg-red-600 text-white"
                            arrowClassName="fill-red-600"
                          >
                            <Button
                              size="icon"
                              variant="destructive"
                              className="cursor-pointer"
                              onClick={() => openDeleteDialog(document.id)}
                              disabled={document.status === "DELETED"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {documents.length === 0 && visibleFolders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}

                {documents.length === 0 && visibleFolders.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No documents in this folder.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        isLoading={isArchiving}
        title="Archive document?"
        description="This document will be moved out of the active repository view but can be restored later."
        confirmText="Archive"
        loadingText="Archiving..."
        onConfirm={handleConfirmArchive}
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title="Remove document?"
        description="This document will be removed from the active system view. This action is soft delete and can be restored later by admin."
        confirmText="Remove"
        loadingText="Removing..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}