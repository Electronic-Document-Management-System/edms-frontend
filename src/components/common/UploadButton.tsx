"use client";

import { usePermission } from "@/hooks/usePermission";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/constants/permissions";

const UploadButton = () => {
    const { canAny } = usePermission();
    const canUpload = canAny([
        PERMISSIONS.DOCUMENT_UPLOAD_ALL,
        PERMISSIONS.DOCUMENT_UPLOAD_OWN

    ]);
    if (!canUpload) return null;

    return (
        <>
            <Button asChild>
                <Link href="/documents/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Link>
            </Button>
        </>
    )
};

export default UploadButton;
