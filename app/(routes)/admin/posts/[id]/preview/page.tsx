import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!post) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Header Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/admin/posts/${id}/edit`}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
              </Link>
              <div className="h-6 w-px bg-yellow-500/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-400">PREVIEW MODE</span>
                {!post.published && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article>
          {/* Category Badge */}
          <Link href={`/blog/category/${post.category.slug}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              {post.category.name}
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(post.createdAt)}</span>
            </div>
            {post.authorId && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.image && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-white/5">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-muted-foreground italic mb-8 pb-8 border-b border-white/10">
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/admin/posts">
                <Button variant="ghost" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Posts
                </Button>
              </Link>
              <Link href={`/admin/posts/${id}/edit`}>
                <Button className="rounded-full">
                  Edit Post
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
