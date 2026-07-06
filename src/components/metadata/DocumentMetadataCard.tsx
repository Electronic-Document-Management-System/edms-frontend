"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Tag, TagIcon, Trash2 } from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getAllMetadataFields } from "@/features/metadata/metadataField.api";
import { MetadataField } from "@/features/metadata/metadataField.types";

import {
    addDocumentMetadata,
    getDocumentMetadata,
    removeDocumentMetadata,
    updateDocumentMetadata,
} from "@/features/metadata/documentMetadata.api";
import { DocumentMetadata } from "@/features/metadata/documentMetadata.types";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";

type DocumentMetadataCardProps = {
    documentId: number;
};

export function DocumentMetadataCard({ documentId }: DocumentMetadataCardProps) {
    const [metadata, setMetadata] = useState<DocumentMetadata[]>([]);
    const [allFields, setAllFields] = useState<MetadataField[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Add / Edit dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DocumentMetadata | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState("");
    const [value, setValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DocumentMetadata | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { can } = usePermission();
    const canCreateMetadata = can(PERMISSIONS.DOCUMENT_METADATA_CREATE_OWN);
    const canUpdateMetadata = can(PERMISSIONS.DOCUMENT_METADATA_UPDATE_OWN);
    const canDeleteMetadata = can(PERMISSIONS.DOCUMENT_METADATA_DELETE_ALL);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [metadataData, fieldsData] = await Promise.all([
                getDocumentMetadata(documentId),
                getAllMetadataFields(),
            ]);
            setMetadata(metadataData);
            setAllFields(fieldsData.filter((f) => f.isActive));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load metadata.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [documentId]);

    const usedFieldIds = useMemo(
        () => new Set(metadata.map((m) => m.metadataField_id)),
        [metadata]
    );

    const availableFields = useMemo(
        () => allFields.filter((f) => !usedFieldIds.has(f.id)),
        [allFields, usedFieldIds]
    );

    const selectedField = useMemo(
        () =>
            editingItem
                ? editingItem.metadataField
                : allFields.find((f) => f.id === Number(selectedFieldId)),
        [editingItem, allFields, selectedFieldId]
    );

    const openAddDialog = () => {
        setEditingItem(null);
        setSelectedFieldId("");
        setValue("");
        setDialogOpen(true);
    };

    const openEditDialog = (item: DocumentMetadata) => {
        setEditingItem(item);
        setSelectedFieldId(String(item.metadataField_id));
        setValue(item.value);
        setDialogOpen(true);
    };

    const openDeleteDialog = (item: DocumentMetadata) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedFieldId) {
            toast.error("Please select a metadata field.");
            return;
        }

        if (!value.trim()) {
            toast.error("Value is required.");
            return;
        }

        try {
            setIsSubmitting(true);

            if (editingItem) {
                const updated = await updateDocumentMetadata(
                    documentId,
                    editingItem.metadataField_id,
                    value.trim()
                );
                setMetadata((prev) =>
                    prev.map((m) => (m.metadataField_id === editingItem.metadataField_id ? updated : m))
                );
                toast.success("Metadata updated successfully.");
            } else {
                const created = await addDocumentMetadata(documentId, {
                    metadata_field_id: Number(selectedFieldId),
                    value: value.trim(),
                });
                setMetadata((prev) => [...prev, created]);
                toast.success("Metadata added successfully.");
            }

            setDialogOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Operation failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        try {
            setIsDeleting(true);
            await removeDocumentMetadata(documentId, selectedItem.metadataField_id);
            setMetadata((prev) =>
                prev.filter((m) => m.metadataField_id !== selectedItem.metadataField_id)
            );
            setDeleteDialogOpen(false);
            setSelectedItem(null);
            toast.success("Metadata removed successfully.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove metadata.");
            setDeleteDialogOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderValueInput = () => {
        if (!selectedField) {
            return (
                <Input
                    placeholder="Select a field first"
                    value={value}
                    disabled
                />
            );
        }

        switch (selectedField.type) {
            case "SELECT":
                return (
                    <Select value={value} onValueChange={setValue}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                            {(selectedField.options ?? []).map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "BOOLEAN":
                return (
                    <Select value={value} onValueChange={setValue}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select true or false" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                    </Select>
                );

            case "DATE":
                return (
                    <Input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
                );

            case "NUMBER":
                return (
                    <Input
                        type="number"
                        placeholder="Enter a number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );

            default:
                return (
                    <Input
                        placeholder="Enter value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                );
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <TagIcon className="h-5 w-5" />
                    Metadata
                </CardTitle>

                <ActionTooltip
                    label="Add metadata"
                    tooltipClassName="bg-slate-900 text-white"
                    arrowClassName="fill-slate-900"
                >
                    {canCreateMetadata && (
                        <Button size="icon" variant="outline" onClick={openAddDialog}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </ActionTooltip>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading metadata...</p>
                ) : metadata.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No metadata added yet.</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {metadata.map((item) => (
                            <div
                                key={item.metadataField_id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <Tag className="h-4 w-4 text-slate-500" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {item.metadataField.name}
                                        </p>
                                        <p className="truncate text-sm font-medium">{item.value}</p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-1">
                                    <ActionTooltip
                                        label="Edit value"
                                        tooltipClassName="bg-slate-900 text-white"
                                        arrowClassName="fill-slate-900"
                                    >
                                        {canUpdateMetadata && (
                                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </ActionTooltip>

                                    <ActionTooltip
                                        label="Remove metadata"
                                        tooltipClassName="bg-red-600 text-white"
                                        arrowClassName="fill-red-600"
                                    >
                                        {canDeleteMetadata && (
                                            <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(item)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        )}
                                    </ActionTooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Metadata" : "Add Metadata"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Field</Label>
                            <Select
                                value={selectedFieldId}
                                onValueChange={(val) => {
                                    setSelectedFieldId(val);
                                    setValue("");
                                }}
                                disabled={!!editingItem}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a metadata field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(editingItem ? allFields : availableFields).map((field) => (
                                        <SelectItem key={field.id} value={String(field.id)}>
                                            {field.name} {field.isRequired && "*"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Value</Label>
                            {renderValueInput()}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmActionDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                isLoading={isDeleting}
                variant="destructive"
                title="Remove this metadata?"
                description={`"${selectedItem?.metadataField.name}" will be removed from this document.`}
                confirmText="Remove"
                loadingText="Removing..."
                onConfirm={handleConfirmDelete}
            />
        </Card>
    );
}