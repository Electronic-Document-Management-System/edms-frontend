import {
  Archive, Building2, CheckSquare, ClipboardList,
  FileText, FolderOpen, GanttChart, KeyRound,
  LayoutDashboard, Lock, ScrollText, Settings,
  Shield, TextCursorInput, Upload, Users,
} from "lucide-react";
import { PERMISSIONS } from "@/constants/permissions";
import type { LucideIcon } from "lucide-react";

export type NavChild = {
  title: string;
  url: string;
  icon: LucideIcon;
  permissions?: string[];
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permissions?: string[];
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    permissions: [PERMISSIONS.DOCUMENT_READ_OWN],
  },
  {
    title: "Upload Document",
    url: "/documents/upload",
    icon: Upload,
    permissions: [PERMISSIONS.DOCUMENT_UPLOAD_OWN],
  },
  {
    title: "Folders",
    url: "/folders",
    icon: FolderOpen,
    permissions: [PERMISSIONS.FOLDER_READ_ALL],
  },
  {
    title: "Archive",
    url: "/archive",
    icon: Archive,
    permissions: [PERMISSIONS.DOCUMENT_ARCHIVE_OWN],
  },
  {
    title: "Workflow",
    url: "/workflow",
    icon: GanttChart,
    permissions: [
      PERMISSIONS.WORKFLOW_READ_OWN,
      PERMISSIONS.WORKFLOW_READ_ASSIGNED,
      PERMISSIONS.WORKFLOW_READ_DEPARTMENT,
      PERMISSIONS.WORKFLOW_READ_ALL,
    ],
    children: [
      {
        title: "Tasks",
        url: "/workflow/tasks",
        icon: CheckSquare,
        permissions: [
          PERMISSIONS.WORKFLOW_READ_OWN,
          PERMISSIONS.WORKFLOW_READ_ALL,

        ],
      },
      {
        title: "Approvals",
        url: "/workflow/approvals",
        icon: ClipboardList,
        permissions: [
          PERMISSIONS.WORKFLOW_APPROVE_ASSIGNED,
          PERMISSIONS.WORKFLOW_READ_ASSIGNED,
        ],
      },
    ],
  },
  {
    title: "Organization",
    url: "/organization",
    icon: Building2,
    permissions: [],
    children: [
      {
        title: "Departments",
        url: "/organization/departments",
        icon: Building2,
        permissions: [PERMISSIONS.DEPARTMENT_READ_ALL],
      },
    ],
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Shield,
    permissions: [],
    children: [
      { title: "Users", url: "/admin/users", icon: Users, permissions: [PERMISSIONS.USER_READ_ALL] },
      { title: "Roles", url: "/admin/roles", icon: KeyRound, permissions: [PERMISSIONS.ROLE_READ_ALL] },
      { title: "Permissions", url: "/admin/permissions", icon: Lock, permissions: [PERMISSIONS.PERMISSION_READ_ALL] },
      { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText, permissions: [PERMISSIONS.AUDIT_LOG_READ_ALL] },
      { title: "Metadata", url: "/admin/metadata", icon: TextCursorInput, permissions: [PERMISSIONS.METADATA_FIELD_READ_ALL] },
      // { title: "Settings", url: "/admin/settings", icon: Settings, permissions: [] },
    ],
  },
]