import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/admin/pagination";
import { PostsTable } from "@/components/admin/posts-table";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getPosts(page: number, query: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const where = query
    ? {
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { content: { contains: query } },
        ],
      }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

async function getStats() {
  const [total, published] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
  ]);

  // Get recent post activity
  const recentPosts = await prisma.post.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  });

  return { total, published, drafts: total - published, recentPosts };
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.q || "";

  const [{ posts, total }, stats] = await Promise.all([
    getPosts(page, query),
    getStats(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage blog articles and news</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-500">{stats.published}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.drafts}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">This Week</p>
          <p className="text-2xl font-bold text-blue-400">{stats.recentPosts}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="w-80 h-10 bg-secondary/50 rounded-lg animate-pulse" />}>
          <AdminSearch placeholder="Search posts..." basePath="/admin/posts" />
        </Suspense>
        {query && (
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Posts Table */}
      <Suspense
        fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <PostsTable posts={posts} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-card p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/admin/posts"
          />
        </div>
      )}
    </div>
  );
}
