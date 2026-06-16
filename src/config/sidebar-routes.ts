import {
  Archive,
  FileText,
  Folder,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";

export const sidebarRoutes = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    permissions: [
      PERMISSIONS.DOCUMENT_READ_OWN,
      PERMISSIONS.DOCUMENT_READ_DEPARTMENT,
      PERMISSIONS.DOCUMENT_READ_ASSIGNED,
      PERMISSIONS.DOCUMENT_READ_SHARED,
      PERMISSIONS.DOCUMENT_READ_ALL,
    ],
  },
  {
    title: "Upload Document",
    href: "/documents/upload",
    icon: FileText,
    permissions: [
      PERMISSIONS.DOCUMENT_UPLOAD_OWN,
      PERMISSIONS.DOCUMENT_UPLOAD_ALL,
    ],
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Users,
    permissions: [PERMISSIONS.DEPARTMENT_READ_ALL],
  },
  {
    title: "Folders",
    href: "/folders",
    icon: Folder,
    permissions: [PERMISSIONS.FOLDER_READ_ALL],
  },
  {
    title: "Archive",
    href: "/archive",
    icon: Archive,
    permissions: [
      PERMISSIONS.DOCUMENT_ARCHIVE_OWN,
      PERMISSIONS.DOCUMENT_ARCHIVE_DEPARTMENT,
      PERMISSIONS.DOCUMENT_ARCHIVE_ALL,
      PERMISSIONS.DOCUMENT_RESTORE_OWN,
      PERMISSIONS.DOCUMENT_RESTORE_DEPARTMENT,
      PERMISSIONS.DOCUMENT_RESTORE_ALL,
    ],
  },
  {
    title: "Workflow",
    href: "/workflow",
    icon: ShieldCheck,
    permissions: [
      PERMISSIONS.WORKFLOW_READ_OWN,
      PERMISSIONS.WORKFLOW_READ_ASSIGNED,
      PERMISSIONS.WORKFLOW_READ_DEPARTMENT,
      PERMISSIONS.WORKFLOW_READ_ALL,
    ],
  },
  {
    title: "Admin Settings",
    href: "/settings",
    icon: Settings,
    permissions: [
      PERMISSIONS.DEPARTMENT_CREATE_ALL,
      PERMISSIONS.DEPARTMENT_UPDATE_ALL,
      PERMISSIONS.DEPARTMENT_DELETE_ALL,
    ],
  },
];