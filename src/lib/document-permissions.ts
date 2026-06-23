import { PERMISSIONS } from "@/constants/permissions";
import { DocumentItem } from "@/features/document/document.types";

type User = {
  id: number;
  dept_id: number;
  permissions: string[];
};

export function canUpdateDocument(user: User, document: DocumentItem) {
  const permissions = user.permissions;

  if (permissions.includes(PERMISSIONS.DOCUMENT_UPDATE_ALL)) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_UPDATE_DEPARTMENT) &&
    user.dept_id === document.dept_id
  ) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_UPDATE_OWN) &&
    user.id === document.uploaded_by
  ) {
    return true;
  }

  return false;
}

export function canDeleteDocument(user: User, document: DocumentItem) {
  const permissions = user.permissions;

  if (permissions.includes(PERMISSIONS.DOCUMENT_DELETE_ALL)) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_DELETE_DEPARTMENT) &&
    user.dept_id === document.dept_id
  ) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_DELETE_OWN) &&
    user.id === document.uploaded_by
  ) {
    return true;
  }

  return false;
}

export function canArchiveDocument(user: User, document: DocumentItem) {
  const permissions = user.permissions;

  if (permissions.includes(PERMISSIONS.DOCUMENT_ARCHIVE_ALL)) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_ARCHIVE_DEPARTMENT) &&
    user.dept_id === document.dept_id
  ) {
    return true;
  }

  if (
    permissions.includes(PERMISSIONS.DOCUMENT_ARCHIVE_OWN) &&
    user.id === document.uploaded_by
  ) {
    return true;
  }

  return false;
}