export const PERMISSIONS = {
    // Documents
    DOCUMENT_UPLOAD_OWN: "document:upload:own",
    DOCUMENT_UPLOAD_ALL: "document:upload:all",

    DOCUMENT_READ_OWN: "document:read:own",
    DOCUMENT_READ_DEPARTMENT: "document:read:department",
    DOCUMENT_READ_ASSIGNED: "document:read:assigned",
    DOCUMENT_READ_SHARED: "document:read:shared",
    DOCUMENT_READ_ALL: "document:read:all",

    DOCUMENT_DOWNLOAD_OWN: "document:download:own",
    DOCUMENT_DOWNLOAD_DEPARTMENT: "document:download:department",
    DOCUMENT_DOWNLOAD_ASSIGNED: "document:download:assigned",
    DOCUMENT_DOWNLOAD_SHARED: "document:download:shared",
    DOCUMENT_DOWNLOAD_ALL: "document:download:all",

    DOCUMENT_UPDATE_OWN: "document:update:own",
    DOCUMENT_UPDATE_DEPARTMENT: "document:update:department",
    DOCUMENT_UPDATE_ALL: "document:update:all",

    DOCUMENT_DELETE_OWN: "document:delete:own",
    DOCUMENT_DELETE_DEPARTMENT: "document:delete:department",
    DOCUMENT_DELETE_ALL: "document:delete:all",

    DOCUMENT_ARCHIVE_OWN: "document:archive:own",
    DOCUMENT_ARCHIVE_DEPARTMENT: "document:archive:department",
    DOCUMENT_ARCHIVE_ALL: "document:archive:all",

    DOCUMENT_RESTORE_OWN: "document:restore:own",
    DOCUMENT_RESTORE_DEPARTMENT: "document:restore:department",
    DOCUMENT_RESTORE_ALL: "document:restore:all",

    DOCUMENT_SHARE_OWN: "document:share:own",
    DOCUMENT_SHARE_ALL: "document:share:all",

    // Departments
    DEPARTMENT_READ_ALL: "department:read:all",
    DEPARTMENT_CREATE_ALL: "department:create:all",
    DEPARTMENT_UPDATE_ALL: "department:update:all",
    DEPARTMENT_DELETE_ALL: "department:delete:all",

    // Folders
    FOLDER_READ_ALL: "folder:read:all",
    FOLDER_CREATE_ALL: "folder:create:all",
    FOLDER_UPDATE_ALL: "folder:update:all",
    FOLDER_DELETE_ALL: "folder:delete:all",
    FOLDER_MOVE_ALL: "folder:move:all",

    // Metadata
    METADATA_FIELD_READ_ALL: "metadataField:read:all",
    METADATA_FIELD_CREATE_ALL: "metadataField:create:all",
    METADATA_FIELD_UPDATE_ALL: "metadataField:update:all",
    METADATA_FIELD_DELETE_ALL: "metadataField:delete:all",

    DOCUMENT_METADATA_CREATE_OWN: "documentMetadata:create:own",
    DOCUMENT_METADATA_CREATE_ALL: "documentMetadata:create:all",
    DOCUMENT_METADATA_READ_OWN: "documentMetadata:read:own",
    DOCUMENT_METADATA_READ_ALL: "documentMetadata:read:all",
    DOCUMENT_METADATA_UPDATE_OWN: "documentMetadata:update:own",
    DOCUMENT_METADATA_UPDATE_ALL: "documentMetadata:update:all",
    DOCUMENT_METADATA_DELETE_ALL: "documentMetadata:delete:all",

    // Document Sharing
    DOCUMENT_SHARE_CREATE_OWN: "documentShare:create:own",
    DOCUMENT_SHARE_CREATE_DEPARTMENT: "documentShare:create:department",
    DOCUMENT_SHARE_CREATE_ALL: "documentShare:create:all",

    DOCUMENT_SHARE_READ_SHARED: "documentShare:read:shared",
    DOCUMENT_SHARE_READ_DEPARTMENT: "documentShare:read:department",
    DOCUMENT_SHARE_READ_ALL: "documentShare:read:all",

    DOCUMENT_SHARE_DELETE_OWN: "documentShare:delete:own",
    DOCUMENT_SHARE_DELETE_DEPARTMENT: "documentShare:delete:department",
    DOCUMENT_SHARE_DELETE_ALL: "documentShare:delete:all",

    // Workflow
    WORKFLOW_SUBMIT_OWN: "workflow:submit:own",
    WORKFLOW_SUBMIT_DEPARTMENT: "workflow:submit:department",
    WORKFLOW_SUBMIT_ALL: "workflow:submit:all",

    WORKFLOW_ASSIGN_DEPARTMENT: "workflow:assign:department",
    WORKFLOW_ASSIGN_ALL: "workflow:assign:all",

    WORKFLOW_READ_OWN: "workflow:read:own",
    WORKFLOW_READ_ASSIGNED: "workflow:read:assigned",
    WORKFLOW_READ_DEPARTMENT: "workflow:read:department",
    WORKFLOW_READ_ALL: "workflow:read:all",

    WORKFLOW_APPROVE_ASSIGNED: "workflow:approve:assigned",
    WORKFLOW_APPROVE_DEPARTMENT: "workflow:approve:department",
    WORKFLOW_APPROVE_ALL: "workflow:approve:all",

    WORKFLOW_REJECT_ASSIGNED: "workflow:reject:assigned",
    WORKFLOW_REJECT_DEPARTMENT: "workflow:reject:department",
    WORKFLOW_REJECT_ALL: "workflow:reject:all",

    WORKFLOW_CANCEL_OWN: "workflow:cancel:own",
    WORKFLOW_CANCEL_DEPARTMENT: "workflow:cancel:department",
    WORKFLOW_CANCEL_ALL: "workflow:cancel:all",

    // Audit / Reports / Notifications
    AUDIT_LOG_READ_ALL: "auditLog:read:all",
    REPORT_GENERATE_ALL: "report:generate:all",
    NOTIFICATION_READ_OWN: "notification:read:own",

    // User Management
    USER_CREATE_ALL: "user:create:all",
    USER_READ_ALL: "user:read:all",
    USER_UPDATE_ALL: "user:update:all",
    USER_DELETE_ALL: "user:delete:all",
    USER_DISABLE_ALL: "user:disable:all",
    USER_ACTIVATE_ALL: "user:activate:all",

    // Role Management
    ROLE_CREATE_ALL: "role:create:all",
    ROLE_ASSIGN_ALL: "role:assign:all",
    ROLE_READ_ALL: "role:read:all",
    ROLE_UPDATE_ALL: "role:update:all",
    ROLE_DELETE_ALL: "role:delete:all",

    // Permission Management
    PERMISSION_CREATE_ALL: "permission:create:all",
    PERMISSION_ASSIGN_ALL: "permission:assign:all",
    PERMISSION_READ_ALL: "permission:read:all",
    PERMISSION_UPDATE_ALL: "permission:update:all",
    PERMISSION_DELETE_ALL: "permission:delete:all",

    // Role Permission Mapping
    ROLE_PERMISSION_ASSIGN_ALL: "rolePermission:assign:all",
    ROLE_PERMISSION_REMOVE_ALL: "rolePermission:remove:all",

    // User Role Mapping
    USER_ROLE_ASSIGN_ALL: "userRole:assign:all",
    USER_ROLE_REMOVE_ALL: "userRole:remove:all",
    USER_ROLE_READ_ALL: "userRole:read:all",
} as const;