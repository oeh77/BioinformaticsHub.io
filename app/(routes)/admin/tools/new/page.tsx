import { prisma } from "@/lib/prisma";
import { ToolForm } from "@/components/admin/tool-form";

export const dynamic = 'force-dynamic';

export default async function NewToolPage() {
  const categories = await prisma.category.findMany({
    where: { type: "TOOL" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Tool</h1>
        <p className="text-muted-foreground mt-1">Create a new bioinformatics tool entry</p>
      </div>

      <ToolForm categories={categories} />
    </div>
  );
}
