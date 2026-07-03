"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Download,
  FileText,
  Folder,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { getFolders } from "@/features/folder/folder.api";
import { Folder as FolderType } from "@/features/folder/folder.types";

import {
  archiveDocument,
  deleteDocument,
  getDocumentById,
  getDocumentDownloadUrl,
} from "@/features/document/document.api";
import { DocumentItem } from "@/features/document/document.types";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentMetadataCard } from "../metadata/DocumentMetadataCard";
import { DocumentWorkflowCard } from "../workflow/DocumentWorkflowCard";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermission } from "@/hooks/usePermission";
import { DocumentVersionsCard } from "../documentVersion/DocumentVersionsCard";

type DocumentDetailClientProps = {
  documentId: number;
};

export function DocumentDetailClient({ documentId }: DocumentDetailClientProps) {
  const router = useRouter();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { can } = usePermission();

  const canDownload = can(PERMISSIONS.DOCUMENT_DOWNLOAD_ALL) ||
    can(PERMISSIONS.DOCUMENT_DOWNLOAD_ASSIGNED) ||
    can(PERMISSIONS.DOCUMENT_DOWNLOAD_SHARED) ||
    can(PERMISSIONS.DOCUMENT_DOWNLOAD_DEPARTMENT) ||
    can(PERMISSIONS.DOCUMENT_DOWNLOAD_OWN);

  const canArchive = can(PERMISSIONS.DOCUMENT_ARCHIVE_OWN) ||
    can(PERMISSIONS.DOCUMENT_ARCHIVE_DEPARTMENT) ||
    can(PERMISSIONS.DOCUMENT_ARCHIVE_ALL);

  const canDelete = can(PERMISSIONS.DOCUMENT_DELETE_OWN) ||
    can(PERMISSIONS.DOCUMENT_DELETE_DEPARTMENT) ||
    can(PERMISSIONS.DOCUMENT_DELETE_ALL);

  const departmentMap = useMemo(() => {
    return new Map(
      departments.map((department) => [department.id, department.name]),
    );
  }, [departments]);

  const folderMap = useMemo(() => {
    return new Map(folders.map((folder) => [folder.id, folder.name]));
  }, [folders]);

  const fetchDocumentDetail = async () => {
    if (!documentId || Number.isNaN(documentId)) {
      toast.error("Invalid document ID.");
      router.push("/documents");
      return;
    }

    try {
      setIsLoading(true);

      const documentData = await getDocumentById(documentId);

      if (documentData.isDeleted) {
        toast.error("This document has been removed.");
        router.push("/documents");
        return;
      }

      setDocument(documentData);

      const [departmentsResult, foldersResult] = await Promise.allSettled([
        getDepartments(),
        getFolders(),
      ]);

      if (departmentsResult.status === "fulfilled") {
        setDepartments(departmentsResult.value);
      }

      if (foldersResult.status === "fulfilled") {
        setFolders(foldersResult.value);
      }

    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to load document details.";

      toast.error(message);
      router.push("/documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetail();
  }, [documentId]);

  const handleDownload = () => {
    if (!document) return;

    window.open(getDocumentDownloadUrl(document.id), "_blank");
  };

  const handleConfirmArchive = async () => {
    if (!document) return;

    try {
      setIsArchiving(true);

      const updatedDocument = await archiveDocument(document.id);

      setDocument(updatedDocument);
      setArchiveDialogOpen(false);

      toast.success("Document archived successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to archive document.";

      setArchiveDialogOpen(false);
      toast.error(message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!document) return;

    try {
      setIsDeleting(true);

      await deleteDocument(document.id);

      setDeleteDialogOpen(false);
      toast.success("Document removed successfully.");

      router.push("/documents");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove document.";

      setDeleteDialogOpen(false);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return "📄";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("word")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📗";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📙";

    return "📄";
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (isLoading || !document) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Loading document details...
        </p>
      </div>
    );
  }

  const departmentName =
    departmentMap.get(document.dept_id) ?? `Department #${document.dept_id}`;

  const folderName =
    folderMap.get(document.folder_id) ?? `Folder #${document.folder_id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 px-0">
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>

          <h2 className="text-2xl font-bold tracking-tight">
            Document Details
          </h2>
          <p className="text-muted-foreground">
            View document information, repository location and available actions.
          </p>
        </div>

        <div className="flex gap-2">
          {canDownload && (
            <ActionTooltip
              label="Download document"
              tooltipClassName="bg-slate-900 text-white"
              arrowClassName="fill-slate-900"
            >
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </ActionTooltip>
          )}

          {canArchive && (
            <ActionTooltip
              label="Archive document"
              tooltipClassName="bg-blue-600 text-white"
              arrowClassName="fill-blue-600"
            >
              <Button
                variant="outline"
                disabled={document.status !== "ACTIVE"}
                onClick={() => setArchiveDialogOpen(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </ActionTooltip>)}
          {canDelete && (
            <ActionTooltip
              label="Remove document"
              tooltipClassName="bg-red-600 text-white"
              arrowClassName="fill-red-600"
            >
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </ActionTooltip>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-3xl">
              {getFileIcon(document.mimeType)}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold">{document.title}</h3>
              <p className="text-sm text-muted-foreground">
                {document.originalName}
              </p>

              {document.description && (
                <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                  {document.description}
                </p>
              )}
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
              {document.status}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Document ID" value={`#${document.id}`} />
              <InfoItem label="Original file" value={document.originalName} />
              <InfoItem label="Stored file" value={document.fileName} />
              <InfoItem label="MIME type" value={document.mimeType} />
              <InfoItem
                label="File size"
                value={formatFileSize(document.fileSize)}
              />
              <InfoItem label="Bucket" value={document.bucketName} />
              <InfoItem label="Object key" value={document.objectKey} />
              <InfoItem
                label="Uploaded on"
                value={new Date(document.createdAt).toLocaleString()}
              />
              <InfoItem
                label="Last updated"
                value={new Date(document.updatedAt).toLocaleString()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository Location</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Folder className="h-4 w-4" />
                Location
              </div>

              <p className="text-sm text-muted-foreground">
                {departmentName} / 📁 {folderName}
              </p>
            </div>

            <InfoItem label="Department" value={departmentName} />
            <InfoItem label="Folder" value={folderName} />
            <InfoItem label="Uploaded by user ID" value={document.uploaded_by} />
          </CardContent>
        </Card>

      </div>
      <DocumentMetadataCard documentId={document.id} />
      <DocumentWorkflowCard documentId={document.id} />
      <DocumentVersionsCard documentId={document.id} />

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 p-8 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />

            <p className="font-medium">Document preview</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Preview engine will be connected later. For now, use the download
              action to open the uploaded file.
            </p>

            {canDownload && (
              <Button className="mt-4" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            )}
          </div>
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
        description="This document will be removed from the active system view. This is a soft delete action."
        confirmText="Remove"
        loadingText="Removing..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

type InfoItemProps = {
  label: string;
  value: string | number | null;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">{value ?? "-"}</p>
    </div>
  );
}