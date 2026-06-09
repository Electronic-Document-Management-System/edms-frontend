import { DocumentDetailClient } from "@/components/document/DocumentDetailClient";

type DocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;

  return <DocumentDetailClient documentId={Number(id)} />;
}