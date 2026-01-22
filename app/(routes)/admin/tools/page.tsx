import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/admin/pagination";
import { ToolsTable } from "@/components/admin/tools-table";
import { ExportButton } from "@/components/admin/export-button";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getTools(page: number, query: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const where = query
    ? {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { slug: { contains: query } },
        ],
      }
    : {};

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.tool.count({ where }),
  ]);

  return { tools, total };
}

async function getStats() {
  const [total, published, featured, categories] = await Promise.all([
    prisma.tool.count(),
    prisma.tool.count({ where: { published: true } }),
    prisma.tool.count({ where: { featured: true } }),
    prisma.tool.groupBy({ by: ["categoryId"] }).then((r) => r.length),
  ]);

  return { total, published, featured, categories };
}

export default async function AdminToolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.q || "";

  const [{ tools, total }, stats] = await Promise.all([
    getTools(page, query),
    getStats(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="text-muted-foreground mt-1">Manage bioinformatics tools directory</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton endpoint="/api/admin/tools" filename="tools" />
          <Link href="/admin/tools/new">
            <Button className="rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Tool
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-500">{stats.published}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Featured</p>
          <p className="text-2xl font-bold text-primary">{stats.featured}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{stats.categories}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="w-80 h-10 bg-secondary/50 rounded-lg animate-pulse" />}>
          <AdminSearch placeholder="Search tools..." basePath="/admin/tools" />
        </Suspense>
        {query && (
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Tools Table */}
      <Suspense
        fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <ToolsTable tools={tools} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-card p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/admin/tools"
          />
        </div>
      )}
    </div>
  );
}
