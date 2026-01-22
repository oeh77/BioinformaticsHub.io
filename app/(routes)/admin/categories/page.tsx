import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree, Pencil } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export const dynamic = "force-dynamic";

const TYPE_COLORS: Record<string, string> = {
  TOOL: "bg-blue-500/10 text-blue-400",
  COURSE: "bg-green-500/10 text-green-400",
  POST: "bg-purple-500/10 text-purple-400",
  RESOURCE: "bg-orange-500/10 text-orange-400",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          tools: true,
          courses: true,
          posts: true,
          resources: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalItems = categories.reduce(
    (acc, cat) =>
      acc +
      cat._count.tools +
      cat._count.courses +
      cat._count.posts +
      cat._count.resources,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage content categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Tool Categories</p>
          <p className="text-2xl font-bold text-blue-400">
            {categories.filter((c) => c.type === "TOOL").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Course Categories</p>
          <p className="text-2xl font-bold text-green-400">
            {categories.filter((c) => c.type === "COURSE").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Linked Items</p>
          <p className="text-2xl font-bold text-primary">{totalItems}</p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Tools
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Courses
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Posts
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Resources
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No categories yet. Add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {category.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          TYPE_COLORS[category.type] || "bg-secondary"
                        }`}
                      >
                        {category.type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium">
                        {category._count.tools}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium">
                        {category._count.courses}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium">
                        {category._count.posts}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium">
                        {category._count.resources}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
