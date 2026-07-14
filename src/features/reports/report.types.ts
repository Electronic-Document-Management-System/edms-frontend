export type DocumentsReportData = {
  totalDocuments: number;
  activeCount: number;
  archivedCount: number;
  byDepartment: { departmentId: number; departmentName: string; count: number }[];
  byStatus: { status: string; count: number }[];
  storageUsed: number;
  recentUploads: { id: number; title: string; uploadedBy: string; createdAt: string }[];
};

export type DepartmentsReportData = {
  totalDepartments: number;
  departments: {
    id: number;
    name: string;
    userCount: number;
    documentCount: number;
    folderCount: number;
  }[];
};

export type WorkflowsReportData = {
  totalWorkflows: number;
  pendingReview: number;
  inReview: number;
  approved: number;
  rejected: number;
  cancelled: number;
  avgTurnaroundHours: number;
  recentActivity: {
    documentTitle: string;
    status: string;
    reviewerName: string | null;
    updatedAt: string;
  }[];
};

export type AuditReportData = {
  totalEvents: number;
  byAction: { action: string; count: number }[];
  byUser: { userId: number; userName: string; count: number }[];
  recentEvents: {
    id: number;
    action: string;
    resource: string;
    user: { name: string };
    createdAt: string;
  }[];
};

export type ReportFilters = {
  departmentId?: number;
  status?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
};