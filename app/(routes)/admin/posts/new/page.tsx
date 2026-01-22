import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    where: { type: "POST" },
    orderBy: { name: "asc" },
  });

  // If no post categories exist, also include all categories as fallback
  const allCategories = categories.length > 0 ? categories : await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Post</h1>
        <p className="text-muted-foreground mt-1">Create a new blog post</p>
      </div>

      <PostForm categories={allCategories} />
    </div>
  );
}
