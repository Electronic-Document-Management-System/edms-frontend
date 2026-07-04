"use client";

import { useEffect, useState } from "react";
import { getDocumentPreviewUrl } from "@/features/document/document.api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type PreviewCardProps = {
  documentId: number;
  mimeType: string;
};

export function DocumentPreviewCard({ documentId, mimeType }: PreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const { previewUrl } = await getDocumentPreviewUrl(documentId);
        setPreviewUrl(previewUrl);
      } catch {
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [documentId]);

  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const isOffice =
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation");

  const googleDocsUrl = previewUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`
    : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </CardContent>
      </Card>
    );
  }

  if (!previewUrl) {
    return (
      <Card>
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Preview unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
      <CardContent>
        {isImage && (
          <img
            src={previewUrl}
            alt="Document preview"
            className="max-h-[600px] w-full rounded-lg object-contain"
          />
        )}

        {isPdf && (
          <iframe
            src={previewUrl}
            className="h-[600px] w-full rounded-lg border"
            title="PDF Preview"
          />
        )}

        {isOffice && googleDocsUrl && (
          <iframe
            src={googleDocsUrl}
            className="h-[600px] w-full rounded-lg border"
            title="Document Preview"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}

        {!isImage && !isPdf && !isOffice && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <p>Preview not available for this file type.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}