import {
  Archive, Building2, CheckSquare, ClipboardList,
  FileText, FolderOpen, GanttChart, KeyRound,
  LayoutDashboard, Lock, ScrollText, Settings,
  Shield, Upload, Users,
} from "lucide-react";
import { PERMISSIONS } from "@/constants/permissions";
import type { LucideIcon } from "lucide-react";

export type NavChild = {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    permission: undefined,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    permission: PERMISSIONS.DOCUMENT_READ_OWN,
  },
  {
    title: "Upload Document",
    url: "/documents/upload",
    icon: Upload,
    permission: PERMISSIONS.DOCUMENT_UPLOAD_OWN,
  },
  {
    title: "Folders",
    url: "/folders",
    icon: FolderOpen,
    permission: PERMISSIONS.FOLDER_READ_ALL,
  },
  {
    title: "Archive",
    url: "/archive",
    icon: Archive,
    permission: PERMISSIONS.DOCUMENT_ARCHIVE_OWN,
  },
  {
    title: "Workflow",
    url: "/workflow",
    icon: GanttChart,
    permission: PERMISSIONS.WORKFLOW_READ_ALL,
    children: [
      {
        title: "Tasks",
        url: "/workflow/tasks",
        icon: CheckSquare,
        permission: PERMISSIONS.WORKFLOW_READ_OWN,
      },
      {
        title: "Approvals",
        url: "/workflow/approvals",
        icon: ClipboardList,
        permission: PERMISSIONS.WORKFLOW_APPROVE_ASSIGNED,
      },
    ],
  },
  {
    title: "Organization",
    url: "/organization",
    icon: Building2,
    permission: undefined,
    children: [
      {
        title: "Departments",
        url: "/organization/departments",
        icon: Building2,
        permission: PERMISSIONS.DEPARTMENT_READ_ALL,
      },
    ],
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Shield,
    permission: undefined,
    children: [
      { title: "Users",       url: "/admin/users",       icon: Users,        permission: PERMISSIONS.USER_READ_ALL },
      { title: "Roles",       url: "/admin/roles",       icon: KeyRound,     permission: PERMISSIONS.ROLE_READ_ALL },
      { title: "Permissions", url: "/admin/permissions", icon: Lock,         permission: PERMISSIONS.PERMISSION_READ_ALL },
      { title: "Settings",    url: "/admin/settings",    icon: Settings,     permission: undefined },
      { title: "Audit Logs",  url: "/admin/audit-logs",  icon: ScrollText,   permission: PERMISSIONS.AUDIT_LOG_READ_ALL },
    ],
  },
];