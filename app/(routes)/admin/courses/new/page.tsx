import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";

export const dynamic = 'force-dynamic';

export default async function NewCoursePage() {
  const categories = await prisma.category.findMany({
    where: { type: "COURSE" },
    orderBy: { name: "asc" },
  });

  // If no course categories exist, also include TOOL categories as fallback
  const allCategories = categories.length > 0 ? categories : await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Course</h1>
        <p className="text-muted-foreground mt-1">Create a new bioinformatics course</p>
      </div>

      <CourseForm categories={allCategories} />
    </div>
  );
}
