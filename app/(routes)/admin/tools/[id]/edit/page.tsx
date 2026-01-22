import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ToolForm } from "@/components/admin/tool-form";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditToolPage({ params }: PageProps) {
  const { id } = await params;
  
  const tool = await prisma.tool.findUnique({
    where: { id },
  });

  if (!tool) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { type: "TOOL" },
    orderBy: { name: "asc" },
  });

  // Fallback to all categories if no TOOL categories exist
  const allCategories = categories.length > 0 ? categories : await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Tool</h1>
        <p className="text-muted-foreground mt-1">Update tool details</p>
      </div>

      <ToolForm categories={allCategories} tool={tool} />
    </div>
  );
}
