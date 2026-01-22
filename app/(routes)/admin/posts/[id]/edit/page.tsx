import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground mt-1">Update blog post</p>
      </div>

      <PostForm categories={categories} post={post} />
    </div>
  );
}
