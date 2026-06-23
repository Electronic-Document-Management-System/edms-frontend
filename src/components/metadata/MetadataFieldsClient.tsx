"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createMetadataField,
  deleteMetadataField,
  getAllMetadataFields,
  updateMetadataField,
} from "@/features/metadata/metadataField.api";
import {
  MetadataField,
  MetadataFieldType,
} from "@/features/metadata/metadataField.types";

const FIELD_TYPES: MetadataFieldType[] = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT"];

const typeBadgeVariant: Record<MetadataFieldType, "default" | "secondary" | "outline"> = {
  TEXT: "outline",
  NUMBER: "outline",
  DATE: "secondary",
  BOOLEAN: "secondary",
  SELECT: "default",
};

type FormState = {
  name: string;
  key: string;
  type: MetadataFieldType;
  isRequired: boolean;
  isActive: boolean;
  options: string[];
};

const emptyForm: FormState = {
  name: "",
  key: "",
  type: "TEXT",
  isRequired: false,
  isActive: true,
  options: [],
};

export function MetadataFieldsClient() {
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<MetadataField | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [optionInput, setOptionInput] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MetadataField | null>(null);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMetadataFields();
      setFields(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load metadata fields.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const openCreateDialog = () => {
    setEditingField(null);
    setForm(emptyForm);
    setOptionInput("");
    setDialogOpen(true);
  };

  const openEditDialog = (field: MetadataField) => {
    setEditingField(field);
    setForm({
      name: field.name,
      key: field.key,
      type: field.type,
      isRequired: field.isRequired,
      isActive: field.isActive,
      options: field.options ?? [],
    });
    setOptionInput("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (field: MetadataField) => {
    setSelectedField(field);
    setDeleteDialogOpen(true);
  };

  const handleAddOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    if (form.options.includes(trimmed)) {
      toast.error("This option already exists.");
      return;
    }
    setForm((f) => ({ ...f, options: [...f.options, trimmed] }));
    setOptionInput("");
  };

  const handleRemoveOption = (option: string) => {
    setForm((f) => ({ ...f, options: f.options.filter((o) => o !== option) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.key.trim()) {
      toast.error("Name and key are required.");
      return;
    }

    if (form.type === "SELECT" && form.options.length === 0) {
      toast.error("SELECT type requires at least one option.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: form.name.trim(),
        key: form.key.trim(),
        type: form.type,
        isRequired: form.isRequired,
        isActive: form.isActive,
        options: form.type === "SELECT" ? form.options : undefined,
      };

      if (editingField) {
        const updated = await updateMetadataField(editingField.id, payload);
        setFields((prev) => prev.map((f) => (f.id === editingField.id ? updated : f)));
        toast.success("Metadata field updated successfully.");
      } else {
        const created = await createMetadataField(payload);
        setFields((prev) => [...prev, created]);
        toast.success("Metadata field created successfully.");
      }

      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedField) return;

    try {
      setIsDeleting(true);
      await deleteMetadataField(selectedField.id);
      setFields((prev) => prev.filter((f) => f.id !== selectedField.id));
      setDeleteDialogOpen(false);
      setSelectedField(null);
      toast.success("Metadata field deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete metadata field.");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metadata Fields</h2>
          <p className="text-muted-foreground">
            Define custom metadata fields available across all documents.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Field
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Metadata Fields</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading metadata fields...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.name}</TableCell>

                    <TableCell>
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {field.key}
                      </code>
                    </TableCell>

                    <TableCell>
                      <Badge variant={typeBadgeVariant[field.type]}>{field.type}</Badge>
                    </TableCell>

                    <TableCell>
                      {field.isRequired ? (
                        <Badge variant="secondary">Required</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Optional</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={field.isActive ? "default" : "secondary"}>
                        {field.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ActionTooltip
                          label="Edit field"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button size="icon" variant="outline" onClick={() => openEditDialog(field)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Delete field"
                          tooltipClassName="bg-red-600 text-white"
                          arrowClassName="fill-red-600"
                        >
                          <Button size="icon" variant="destructive" onClick={() => openDeleteDialog(field)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No metadata fields defined yet.
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
            <DialogTitle>
              {editingField ? "Edit Metadata Field" : "Create Metadata Field"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                placeholder="e.g. Contract Date, Vendor Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-key">Key</Label>
              <Input
                id="field-key"
                placeholder="e.g. contract_date"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm((f) => ({ ...f, type: val as MetadataFieldType }))}
              >
                <SelectTrigger id="field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.type === "SELECT" && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an option"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddOption}>
                    Add
                  </Button>
                </div>

                {form.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.options.map((option) => (
                      <Badge key={option} variant="outline" className="gap-1">
                        {option}
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option)}
                          className="ml-1 rounded-full hover:bg-slate-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="is-required" className="cursor-pointer">
                Required field
              </Label>
              <Switch
                id="is-required"
                checked={form.isRequired}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isRequired: checked }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="is-active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="is-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? editingField ? "Updating..." : "Creating..."
                  : editingField ? "Update Field" : "Create Field"}
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
        title={`Delete "${selectedField?.name}"?`}
        description="This field will be permanently removed. Fields already used by documents cannot be deleted."
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}