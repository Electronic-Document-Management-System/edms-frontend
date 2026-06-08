"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmActionDialogVariant = "default" | "destructive";

type ConfirmActionDialogProps = {
  open: boolean;
  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;
  loadingText?: string;

  variant?: ConfirmActionDialogVariant;
  isLoading?: boolean;

  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmActionDialog({
  open,
  title = "Are you sure?",
  description = "Please confirm this action.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Please wait...",
  variant = "default",
  isLoading = false,
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) {
  const actionClassName =
    variant === "destructive"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            className={actionClassName}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isLoading ? loadingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}