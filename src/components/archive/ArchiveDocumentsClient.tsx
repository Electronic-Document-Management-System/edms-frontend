"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { getFolders } from "@/features/folder/folder.api";
import { Folder } from "@/features/folder/folder.types";

import {
  deleteDocument,
  getDocumentDownloadUrl,
  getDocuments,
  restoreDocument,
} from "@/features/document/document.api";
import { DocumentItem } from "@/features/document/document.types";

import { ActionTooltip } from "@/components/common/ActionTooltip";
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

export function ArchiveDocumentsClient() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
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

  const fetchArchivedDocuments = async () => {
    try {
      setIsLoading(true);

      const [departmentsData, foldersData, documentsData] = await Promise.all([
        getDepartments(),
        getFolders(),
        getDocuments({
          search: search.trim() || undefined,
          status: "ARCHIVED",
          page: 1,
          limit: 50,
        }),
      ]);

      setDepartments(departmentsData);
      setFolders(foldersData);

      setDocuments(
        documentsData.filter(
          (document) => document.isArchived && !document.isDeleted,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load archived documents.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedDocuments();
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("word")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return "📗";
    }
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
      return "📙";
    }

    return "📄";
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = (documentId: number) => {
    window.open(getDocumentDownloadUrl(documentId), "_blank");
  };

  const openRestoreDialog = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setRestoreDialogOpen(true);
  };

  const openDeleteDialog = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedDocumentId) return;

    try {
      setIsRestoring(true);

      await restoreDocument(selectedDocumentId);

      setDocuments((prev) =>
        prev.filter((document) => document.id !== selectedDocumentId),
      );

      setRestoreDialogOpen(false);
      setSelectedDocumentId(null);

      toast.success("Document restored successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to restore document.";

      setRestoreDialogOpen(false);
      setSelectedDocumentId(null);
      toast.error(message);
    } finally {
      setIsRestoring(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Archive</h2>
        <p className="text-muted-foreground">
          View and restore archived documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archive Filters</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search archived documents"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Button onClick={fetchArchivedDocuments} disabled={isLoading}>
              {isLoading ? "Searching..." : "Apply Filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archived Documents</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading archived documents...
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
                  <TableHead>Archived</TableHead>
                  <TableHead className="w-[170px] text-right">
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
                        className="group flex items-center gap-3 rounded-md py-1 transition hover:text-blue-600"
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

                    <TableCell>{formatFileSize(document.fileSize)}</TableCell>

                    <TableCell>
                      {document.archivedAt
                        ? new Date(document.archivedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ActionTooltip
                          label="View details"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button size="icon" variant="outline" asChild>
                            <Link href={`/documents/${document.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Download document"
                          tooltipClassName="bg-blue-600 text-white"
                          arrowClassName="fill-blue-600"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDownload(document.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Restore document"
                          tooltipClassName="bg-green-600 text-white"
                          arrowClassName="fill-green-600"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openRestoreDialog(document.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
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
                            onClick={() => openDeleteDialog(document.id)}
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
                      No archived documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        isLoading={isRestoring}
        title="Restore document?"
        description="This document will be restored to the active repository."
        confirmText="Restore"
        loadingText="Restoring..."
        onConfirm={handleConfirmRestore}
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title="Remove document?"
        description="This document will be removed from archive and moved to deleted documents."
        confirmText="Remove"
        loadingText="Removing..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}