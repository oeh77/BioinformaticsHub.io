import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({ params }: PageProps) {
  const { id } = await params;
  
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Resource</h1>
        <p className="text-muted-foreground mt-1">Update resource details</p>
      </div>

      <ResourceForm categories={categories} resource={resource} />
    </div>
  );
}
