import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/admin/pagination";
import { ResourcesTable } from "@/components/admin/resources-table";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getResources(page: number, query: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const where = query
    ? {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { type: { contains: query } },
        ],
      }
    : {};

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.resource.count({ where }),
  ]);

  return { resources, total };
}

async function getStats() {
  const total = await prisma.resource.count();
  
  const types = await prisma.resource.groupBy({
    by: ["type"],
    _count: true,
  });

  return { 
    total, 
    types: types.length,
    typeBreakdown: types.slice(0, 3), // Top 3 types
  };
}

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.q || "";

  const [{ resources, total }, stats] = await Promise.all([
    getResources(page, query),
    getStats(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage databases, datasets, and documentation</p>
        </div>
        <Link href="/admin/resources/new">
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Resource
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Resources</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Resource Types</p>
          <p className="text-2xl font-bold text-blue-400">{stats.types}</p>
        </div>
        {stats.typeBreakdown.slice(0, 2).map((type) => (
          <div key={type.type} className="glass-card p-4">
            <p className="text-xs text-muted-foreground">{type.type}</p>
            <p className="text-2xl font-bold text-orange-400">{type._count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="w-80 h-10 bg-secondary/50 rounded-lg animate-pulse" />}>
          <AdminSearch placeholder="Search resources..." basePath="/admin/resources" />
        </Suspense>
        {query && (
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Resources Table */}
      <Suspense
        fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <ResourcesTable resources={resources} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-card p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/admin/resources"
          />
        </div>
      )}
    </div>
  );
}
