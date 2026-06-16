import { apiClient } from "@/lib/api-client";
import {
    CreateFolderInput,
    FolderResponse,
    FoldersResponse,
    UpdateFolderInput,
} from "./folder.types";

type GetFoldersParams = {
  departmentId?: number;
  parentId?: number | null;
};

export async function getFolders(params: GetFoldersParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.departmentId) {
    searchParams.set("departmentId", String(params.departmentId));
  }

  if (params.parentId === null) {
    searchParams.set("parentId", "null");
  }

  if (typeof params.parentId === "number") {
    searchParams.set("parentId", String(params.parentId));
  }

  const queryString = searchParams.toString();

  const response = await apiClient<FoldersResponse>(
    `/folders${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

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