export type Folder = {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    dept_id: number;
    createdById: number | null;
    createdAt: string;
    updatedAt: string;
};

export type FoldersResponse = {
    statusCode: number;
    data: {
        folders: Folder[];
    };
    message: string;
    success: boolean;
};

export type FolderResponse = {
    statusCode: number;
    data: {
        folder: Folder;
    };
    message: string;
    success: boolean;
};

export type CreateFolderInput = {
    name: string;
    description?: string;
    dept_id: number;
    parent_id?: number | null;
};

export type UpdateFolderInput = {
    name?: string;
    description?: string;
    dept_id?: number;
    parent_id?: number | null;
};