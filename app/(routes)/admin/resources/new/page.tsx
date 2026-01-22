import { prisma } from "@/lib/prisma";
import { ResourceForm } from "@/components/admin/resource-form";

export const dynamic = 'force-dynamic';

export default async function NewResourcePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Resource</h1>
        <p className="text-muted-foreground mt-1">Create a new bioinformatics resource</p>
      </div>

      <ResourceForm categories={categories} />
    </div>
  );
}
