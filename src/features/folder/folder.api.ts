import { apiClient } from "@/lib/api-client";
import {
    CreateFolderInput,
    FolderResponse,
    FoldersResponse,
    UpdateFolderInput,
} from "./folder.types";

export async function getFolders() {
    const response = await apiClient<FoldersResponse>("/folders", {
        method: "GET",
    });

    return response.data.folders;
}

export async function getFoldersByDepartment(departmentId: number) {
    const response = await apiClient<FoldersResponse>(
        `/folders?departmentId=${departmentId}`,
        {
            method: "GET",
        },
    );

    return response.data.folders;
}

export async function createFolder(input: CreateFolderInput) {
    const response = await apiClient<FolderResponse>("/folders", {
        method: "POST",
        body: JSON.stringify(input),
    });

    return response.data.folder;
}

export async function updateFolder(folderId: number, input: UpdateFolderInput) {
    const response = await apiClient<FolderResponse>(`/folders/${folderId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

    return response.data.folder;
}

export async function deleteFolder(folderId: number) {
    const response = await apiClient<FolderResponse>(`/folders/${folderId}`, {
        method: "DELETE",
    });

    return response.data.folder;
}

export async function moveFolder(
  folderId: number,
  input: { parent_id: number | null },
) {
  const response = await apiClient<FolderResponse>(`/folders/${folderId}/move`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.data.folder;
}