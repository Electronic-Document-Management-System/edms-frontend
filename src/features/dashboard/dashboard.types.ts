export type Department = {
    id: number;
    name: string;
    parent_id: number | null;
};

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

export type DocumentItem = {
    id: number;
    title: string;
    description: string | null;
    originalName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    bucketName: string;
    objectKey: string;
    status: "ACTIVE" | "ARCHIVED" | "DELETED" | string;
    isArchived: boolean;
    archivedAt: string | null;
    archivedBy: number | null;
    isDeleted: boolean;
    deletedAt: string | null;
    deletedBy: number | null;
    dept_id: number;
    folder_id: number;
    uploaded_by: number;
    createdAt: string;
    updatedAt: string;
};

export type DepartmentsResponse = {
    statusCode: number;
    data: {
        departments: Department[];
    };
    message: string;
    success: boolean;
};

export type FoldersResponse = {
    statusCode: number;
    data: {
        folders: Folder[];
    };
    message: string;
    success: boolean;
};

export type DocumentsResponse = {
    statusCode: number;
    data: {
        documents: DocumentItem[];
    };
    message: string;
    success: boolean;
};

export type RecentDocument = DocumentItem & {
    departmentName: string;
    folderName: string;
};

export type DashboardStats = {
    totalDepartments: number;
    totalFolders: number;
    totalDocuments: number;
    archivedDocuments: number;
    recentDocuments: RecentDocument[];
};