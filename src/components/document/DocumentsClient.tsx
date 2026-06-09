"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Eye,
  FileText,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

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

export function DocumentsClient() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

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

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      const data = await getDocuments({
        search: search.trim() || undefined,
        departmentId:
          departmentId === "all" ? undefined : Number(departmentId),
        folderId: folderId === "all" ? undefined : Number(folderId),
        status: status === "all" ? undefined : status,
        page: 1,
        limit: 20,
      });

      setDocuments(data.filter((document) => !document.isDeleted));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load documents.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
      setDocuments(documentsData.filter((document) => !document.isDeleted));
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
  }, [departmentId]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Browse, search and manage repository documents.
          </p>
        </div>

        <Button asChild>
          <Link href="/documents/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
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
                    <span className="flex items-center gap-2">
                      <span>📁</span>
                      {folder.name}
                    </span>
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

        <CardContent>
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
                      <span className="inline-flex items-center gap-2">
                        <span>📁</span>
                        {folderMap.get(document.folder_id) ??
                          `Folder #${document.folder_id}`}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
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
                          <Button size="icon" variant="outline" className="cursor-pointer" asChild>
                            <Link href={`/documents/${document.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </ActionTooltip>

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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {documents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No documents found.
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