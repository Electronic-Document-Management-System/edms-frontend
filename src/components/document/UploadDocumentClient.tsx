"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { getDepartments } from "@/features/department/department.api";
import { Department } from "@/features/department/department.types";

import { getFolders } from "@/features/folder/folder.api";
import { Folder } from "@/features/folder/folder.types";

import { uploadDocument } from "@/features/document/document.api";

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
import { Textarea } from "@/components/ui/textarea";

export function UploadDocumentClient() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deptId, setDeptId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const filteredFolders = useMemo(() => {
    if (!deptId) return [];

    return folders.filter((folder) => folder.dept_id === Number(deptId));
  }, [folders, deptId]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [departmentsData, foldersData] = await Promise.all([
        getDepartments(),
        getFolders(),
      ]);

      setDepartments(departmentsData);
      setFolders(foldersData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load upload data.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setFolderId("");
  }, [deptId]);

  const resetFile = () => {
    setFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    if (!title.trim()) {
      const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExtension);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Document title is required.");
      return false;
    }

    if (!deptId) {
      toast.error("Please select a department.");
      return false;
    }

    if (!folderId) {
      toast.error("Please select a folder.");
      return false;
    }

    if (!file) {
      toast.error("Please select a file to upload.");
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      setError("");

      await uploadDocument({
        title,
        description,
        dept_id: Number(deptId),
        folder_id: Number(folderId),
        file: file as File,
      });

      toast.success("Document uploaded successfully.");

      router.push("/documents");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload document.";

      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedDepartment = departments.find(
    (department) => department.id === Number(deptId),
  );

  const selectedFolder = folders.find((folder) => folder.id === Number(folderId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
        <p className="text-muted-foreground">
          Upload a document into the EDMS repository.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document title</label>
              <Input
                placeholder="Enter document title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>

              <Select
                value={deptId}
                onValueChange={setDeptId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>

                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={String(department.id)}
                    >
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>

              <Select
                value={folderId}
                onValueChange={setFolderId}
                disabled={!deptId || isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      deptId ? "Select folder" : "Select department first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {filteredFolders.map((folder) => (
                    <SelectItem key={folder.id} value={String(folder.id)}>
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">📁</span>
                        {folder.name}
                      </span>
                    </SelectItem>
                  ))}

                  {deptId && filteredFolders.length === 0 && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No folders found for this department.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Selected location</label>

              <div className="flex h-10 items-center rounded-md border background px-3 text-sm text-muted-foreground">
                {selectedDepartment && selectedFolder ? (
                  <span>
                    {selectedDepartment.name} / 📁 {selectedFolder.name}
                  </span>
                ) : (
                  <span>No location selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>

            <Textarea
              placeholder="Enter short document description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 ">
          {!file ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 py-10 text-center transition hover:bg-foreground">
              <FileUp className="mb-3 h-10 w-10 text-muted-foreground" />

              <p className="text-sm font-medium">Click to select a file</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOCX, XLSX, PPTX, TXT, JPG, PNG and other supported files
              </p>

              <Input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB • {file.type || "Unknown type"}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isUploading}
                onClick={resetFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => router.push("/documents")}
            >
              Cancel
            </Button>

            <Button disabled={isUploading || isLoading} onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}