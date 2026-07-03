"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, History, Plus, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
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
import { Textarea } from "@/components/ui/textarea";

import { usePermission } from "@/hooks/usePermission";

import {
    createDocumentVersion,
    getDocumentVersions,
    restoreDocumentVersion,
} from "@/features/documentVersion/documentVersion.api";
import { DocumentVersion } from "@/features/documentVersion/documentVersion.types";

type DocumentVersionsCardProps = {
    documentId: number;
};

const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("word")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📗";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📙";
    return "📄";
};

const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export function DocumentVersionsCard({ documentId }: DocumentVersionsCardProps) {
    const { can } = usePermission();

    const canUploadVersion = can("document:upload:own") || can("document:upload:all");
    const canRestore = can("document:restore:own") || can("document:restore:department") || can("document:restore:all");

    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Upload dialog
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [changeNote, setChangeNote] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Restore dialog
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
    const [restoreNote, setRestoreNote] = useState("");
    const [isRestoring, setIsRestoring] = useState(false);

    const fetchVersions = async () => {
        try {
            setIsLoading(true);
            const data = await getDocumentVersions(documentId);
            setVersions(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load versions.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, [documentId]);

    const openUploadDialog = () => {
        setSelectedFile(null);
        setChangeNote("");
        setUploadDialogOpen(true);
    };

    const openRestoreDialog = (version: DocumentVersion) => {
        setSelectedVersion(version);
        setRestoreNote(`Restored from version ${version.versionNumber}`);
        setRestoreDialogOpen(true);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file.");
            return;
        }

        try {
            setIsUploading(true);
            await createDocumentVersion(documentId, selectedFile, changeNote);
            toast.success("New version uploaded successfully.");
            setUploadDialogOpen(false);
            await fetchVersions();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload version.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmRestore = async () => {
        if (!selectedVersion) return;

        try {
            setIsRestoring(true);
            await restoreDocumentVersion(documentId, selectedVersion.id, restoreNote);
            toast.success(`Version ${selectedVersion.versionNumber} restored successfully.`);
            setRestoreDialogOpen(false);
            setSelectedVersion(null);
            await fetchVersions();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to restore version.");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Version History
                </CardTitle>

                {canUploadVersion && (
                    <ActionTooltip
                        label="Upload new version"
                        tooltipClassName="bg-slate-900 text-white"
                        arrowClassName="fill-slate-900"
                    >
                        <Button size="sm" onClick={openUploadDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Version
                        </Button>
                    </ActionTooltip>
                )}
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading versions...</p>
                ) : versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No versions found.</p>
                ) : (
                    <div className="space-y-3">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`flex items-center justify-between rounded-lg border p-3 ${version.isCurrent ? "border-primary bg-primary/5" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{getFileIcon(version.mimeType)}</span>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                Version {version.versionNumber}
                                            </span>
                                            {version.isCurrent && (
                                                <Badge variant="default" className="text-xs">Current</Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {version.originalName} · {formatFileSize(version.fileSize)}
                                        </p>

                                        {version.changeNote && (
                                            <p className="mt-0.5 text-xs text-muted-foreground italic">
                                                "{version.changeNote}"
                                            </p>
                                        )}

                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {version.uploadedBy.name} · {new Date(version.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {canRestore && !version.isCurrent && (
                                    <ActionTooltip
                                        label={`Restore version ${version.versionNumber}`}
                                        tooltipClassName="bg-slate-900 text-white"
                                        arrowClassName="fill-slate-900"
                                    >
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => openRestoreDialog(version)}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </ActionTooltip>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Upload New Version Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload New Version</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>File</Label>
                            <div
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition hover:bg-slate-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                                {selectedFile ? (
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Click to select a file
                                    </p>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="change-note">Change Note (optional)</Label>
                            <Textarea
                                id="change-note"
                                placeholder="Describe what changed in this version..."
                                value={changeNote}
                                onChange={(e) => setChangeNote(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setUploadDialogOpen(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                                {isUploading ? "Uploading..." : "Upload Version"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Restore Confirm Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Restore Version {selectedVersion?.versionNumber}?
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                            This will create a new version using the content from version{" "}
                            {selectedVersion?.versionNumber}. Current version will be preserved in history.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="restore-note">Restore Note (optional)</Label>
                            <Input
                                id="restore-note"
                                value={restoreNote}
                                onChange={(e) => setRestoreNote(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setRestoreDialogOpen(false)}
                                disabled={isRestoring}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmRestore} disabled={isRestoring}>
                                {isRestoring ? "Restoring..." : "Restore"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}