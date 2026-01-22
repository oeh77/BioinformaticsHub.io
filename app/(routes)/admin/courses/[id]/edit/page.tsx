import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground mt-1">Update course details</p>
      </div>

      <CourseForm categories={categories} course={course} />
    </div>
  );
}
