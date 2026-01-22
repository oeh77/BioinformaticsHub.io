import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/admin/pagination";
import { CoursesTable } from "@/components/admin/courses-table";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getCourses(page: number, query: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const where = query
    ? {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { provider: { contains: query } },
        ],
      }
    : {};

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, total };
}

async function getStats() {
  const [total, published, providers] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.course.groupBy({ by: ["provider"] }).then((r) => r.length),
  ]);

  const levels = await prisma.course.groupBy({
    by: ["level"],
    _count: true,
  });

  return { total, published, providers, levels };
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.q || "";

  const [{ courses, total }, stats] = await Promise.all([
    getCourses(page, query),
    getStats(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage training courses and tutorials</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Course
          </Button>
        </Link>
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
          <p className="text-xs text-muted-foreground">Providers</p>
          <p className="text-2xl font-bold text-blue-400">{stats.providers}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.total - stats.published}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="w-80 h-10 bg-secondary/50 rounded-lg animate-pulse" />}>
          <AdminSearch placeholder="Search courses..." basePath="/admin/courses" />
        </Suspense>
        {query && (
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Courses Table */}
      <Suspense
        fallback={
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <CoursesTable courses={courses} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-card p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/admin/courses"
          />
        </div>
      )}
    </div>
  );
}
