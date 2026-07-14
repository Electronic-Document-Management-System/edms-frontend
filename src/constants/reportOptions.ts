export const AUDIT_RESOURCE_OPTIONS = [
    { value: "document", label: "Document" },
    { value: "folder", label: "Folder" },
    { value: "department", label: "Department" },
    { value: "user", label: "User" },
    { value: "role", label: "Role" },
    { value: "permission", label: "Permission" },
    { value: "workflow", label: "Workflow" },
    { value: "comment", label: "Comment" },
    { value: "metadata", label: "Metadata" },
];

export const AUDIT_ACTION_OPTIONS = [
    { value: "DOCUMENT_CREATED", label: "Document Created" },
    { value: "DOCUMENT_VIEWED", label: "Document Viewed" },
    { value: "DOCUMENT_UPDATED", label: "Document Updated" },
    { value: "DOCUMENT_DELETED", label: "Document Deleted" },
    { value: "DOCUMENT_ARCHIVED", label: "Document Archived" },
    { value: "DOCUMENT_RESTORED", label: "Document Restored" },
    { value: "DOCUMENT_DOWNLOADED", label: "Document Downloaded" },
    { value: "DOCUMENT_SHARED", label: "Document Shared" },
    { value: "DOCUMENT_SHARE_REMOVED", label: "Document Share Removed" },
    { value: "DOCUMENT_VERSION_CREATED", label: "Document Version Created" },
    { value: "DOCUMENT_VERSION_RESTORED", label: "Document Version Restored" },
    { value: "FOLDER_CREATED", label: "Folder Created" },
    { value: "FOLDER_UPDATED", label: "Folder Updated" },
    { value: "FOLDER_DELETED", label: "Folder Deleted" },
    { value: "FOLDER_MOVED", label: "Folder Moved" },
    { value: "DEPARTMENT_CREATED", label: "Department Created" },
    { value: "DEPARTMENT_UPDATED", label: "Department Updated" },
    { value: "DEPARTMENT_DELETED", label: "Department Deleted" },
    { value: "WORKFLOW_SUBMITTED", label: "Workflow Submitted" },
    { value: "WORKFLOW_REVIEWER_ASSIGNED", label: "Workflow Reviewer Assigned" },
    { value: "WORKFLOW_APPROVED", label: "Workflow Approved" },
    { value: "WORKFLOW_REJECTED", label: "Workflow Rejected" },
    { value: "WORKFLOW_CANCELLED", label: "Workflow Cancelled" },
    { value: "USER_CREATED", label: "User Created" },
    { value: "USER_UPDATED", label: "User Updated" },
    { value: "USER_DISABLED", label: "User Disabled" },
    { value: "USER_ACTIVATED", label: "User Activated" },
    { value: "USER_ROLE_ASSIGNED", label: "User Role Assigned" },
    { value: "USER_ROLE_REMOVED", label: "User Role Removed" },

    { value: "ROLE_CREATED", label: "Role Created" },
    { value: "ROLE_UPDATED", label: "Role Updated" },
    { value: "ROLE_DELETED", label: "Role Deleted" },

    { value: "PERMISSION_CREATED", label: "Permission Created" },
    { value: "PERMISSION_UPDATED", label: "Permission Updated" },
    { value: "PERMISSION_DELETED", label: "Permission Deleted" },
    { value: "PERMISSION_ASSIGNED_TO_ROLE", label: "Permission Assigned to Role" },
    { value: "PERMISSION_REMOVED_FROM_ROLE", label: "Permission Removed from Role" },

    { value: "USER_LOGIN", label: "User Login" },
    { value: "USER_LOGOUT", label: "User Logout" },

    { value: "METADATA_FIELD_CREATED", label: "Metadata Field Created" },
    { value: "METADATA_FIELD_UPDATED", label: "Metadata Field Updated" },
    { value: "METADATA_FIELD_DELETED", label: "Metadata Field Deleted" },
    { value: "DOCUMENT_METADATA_ADDED", label: "Document Metadata Added" },
    { value: "DOCUMENT_METADATA_UPDATED", label: "Document Metadata Updated" },
    { value: "DOCUMENT_METADATA_REMOVED", label: "Document Metadata Removed" },

    { value: "COMMENT_ADDED", label: "Comment Added" },
    { value: "COMMENT_UPDATED", label: "Comment Updated" },
    { value: "COMMENT_DELETED", label: "Comment Deleted" },
];


export const WORKFLOW_STATUS_OPTIONS = [
    { value: "PENDING_REVIEW", label: "Pending Review" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
];


export const DOCUMENT_STATUS_OPTIONS = [
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ARCHIVED", label: "Archived" },
];