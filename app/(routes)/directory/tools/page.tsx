import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Wrench, ExternalLink, Star, ArrowRight } from "lucide-react";
import { getCategoryStyle, getCategoryImage } from "@/lib/utils";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  
  const category = typeof params.category === "string" ? params.category : "";
  const pricing = typeof params.pricing === "string" ? params.pricing : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const search = typeof params.q === "string" ? params.q : "";

  // Build query filters
  const where: Prisma.ToolWhereInput = {
    published: true,
    ...(category && { category: { slug: category } }),
    ...(pricing && { pricing: { contains: pricing } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  // Build order by
  let orderBy: Prisma.ToolOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "featured":
      orderBy = { featured: "desc" };
      break;
  }

  const tools = await prisma.tool.findMany({
    where,
    include: { category: true },
    orderBy,
  });

  const categories = await prisma.category.findMany({
    where: { 
      type: 'TOOL',
      tools: { some: { published: true } }
    },
    orderBy: { name: "asc" },
  });

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "featured", label: "Featured First" },
  ];

  return (
    <>
      <PageHeader 
        title="All Bioinformatics Tools"
        subtitle="Browse our complete collection of bioinformatics tools, libraries, and platforms."
        backgroundImage={getCategoryImage('tools')}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          href="/directory" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          ← Back to Directory
        </Link>

        {/* Filter Bar */}
        <FilterBar 
          categories={categories}
          totalItems={tools.length}
          itemType="tool"
          sortOptions={sortOptions}
          showPricing={true}
        />

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tools.map((tool) => {
            const style = getCategoryStyle(tool.category.slug);
            return (
              <Link 
                key={tool.id}
                href={`/directory/tool/${tool.slug}`}
                className="glass-card p-6 block hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-white/5 hover:border-white/20"
              >
                {/* Feature Badge */}
                {tool.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-yellow-500" /> Featured
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                    {tool.category.name}
                  </span>
                </div>

                {/* Tool Info */}
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {tool.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {tool.pricing && (
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      tool.pricing.toLowerCase() === 'free' 
                        ? 'bg-green-500/10 text-green-500' 
                        : tool.pricing.toLowerCase() === 'paid'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {tool.pricing}
                    </span>
                  )}
                  <span className="text-xs text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {tools.length === 0 && (
          <div className="text-center py-16">
            <Wrench className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Tools Found</h3>
            <p className="text-muted-foreground mb-6">
              {search || category || pricing 
                ? "Try adjusting your filters or search terms."
                : "Check back soon for new tools!"}
            </p>
            <Button asChild>
              <Link href="/directory/tools">View All Tools</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
