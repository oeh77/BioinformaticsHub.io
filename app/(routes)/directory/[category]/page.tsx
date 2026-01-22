import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight, Star, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyle, getCategoryImage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Prisma } from "@prisma/client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const queryParams = await searchParams;

  const pricing = typeof queryParams.pricing === "string" ? queryParams.pricing : "";
  const sort = typeof queryParams.sort === "string" ? queryParams.sort : "newest";
  const search = typeof queryParams.q === "string" ? queryParams.q : "";

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  // Build query filters for tools
  const toolWhere: Prisma.ToolWhereInput = {
    categoryId: category.id,
    published: true,
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
    where: toolWhere,
    orderBy,
  });

  const courses = await prisma.course.findMany({
    where: { categoryId: category.id, published: true },
  });

  const resources = await prisma.resource.findMany({
    where: { categoryId: category.id },
  });

  const style = getCategoryStyle(category.slug);
  const bgImage = getCategoryImage(category.slug);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "featured", label: "Featured First" },
  ];

  const pricingOptions = [
    { value: "", label: "All Pricing" },
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
  ];

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    if (updates.sort && updates.sort !== "newest") params.set("sort", updates.sort);
    if (updates.pricing) params.set("pricing", updates.pricing);
    if (updates.q) params.set("q", updates.q);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  return (
    <>
      <PageHeader 
        title={category.name}
        subtitle={category.description || `Browse best-in-class tools for ${category.name}`}
        backgroundImage={bgImage}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/directory" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-8 group w-fit">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                 <ArrowLeft className="w-3 h-3" /> 
            </div>
            Back to Directory
        </Link>
        
        <div className="flex flex-col gap-16">
            {/* Tools Section */}
            {tools.length > 0 || search || pricing ? (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold">Tools & Libraries</h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${style.bg} ${style.text}`}>{tools.length}</span>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 glass rounded-xl">
                        {/* Search */}
                        <form action="" method="GET" className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                name="q"
                                defaultValue={search}
                                placeholder="Search tools..."
                                className="w-full px-4 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm"
                            />
                            <input type="hidden" name="sort" value={sort} />
                            <input type="hidden" name="pricing" value={pricing} />
                        </form>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="sort-select" className="text-sm text-muted-foreground">Sort:</label>
                            <select
                                id="sort-select"
                                title="Sort tools"
                                defaultValue={sort}
                                onChange={(e) => {
                                    const url = buildUrl({ sort: e.target.value, pricing, q: search });
                                    window.location.href = `/directory/${categorySlug}${url}`;
                                }}
                                className="px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm cursor-pointer"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pricing Filter */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="pricing-select" className="text-sm text-muted-foreground">Pricing:</label>
                            <select
                                id="pricing-select"
                                title="Filter by pricing"
                                defaultValue={pricing}
                                onChange={(e) => {
                                    const url = buildUrl({ sort, pricing: e.target.value, q: search });
                                    window.location.href = `/directory/${categorySlug}${url}`;
                                }}
                                className="px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm cursor-pointer"
                            >
                                {pricingOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(search || pricing || sort !== "newest") && (
                            <Link 
                                href={`/directory/${categorySlug}`}
                                className="text-sm text-red-500 hover:text-red-400 flex items-center"
                            >
                                Clear Filters
                            </Link>
                        )}
                    </div>
                    
                    {tools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tools.map(tool => (
                                <div key={tool.id} className="glass-card p-6 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/5 hover:border-white/20 group relative overflow-hidden">
                                    {/* Side accent */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.gradient.replace('bg-', '')} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{tool.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {tool.pricing && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                                                        tool.pricing.toLowerCase() === 'free' 
                                                            ? 'bg-green-500/20 text-green-500' 
                                                            : tool.pricing.toLowerCase() === 'paid'
                                                            ? 'bg-red-500/20 text-red-500'
                                                            : 'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                        {tool.pricing}
                                                    </span>
                                                )}
                                                {tool.featured && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                                                        <Star className="w-3 h-3 fill-yellow-500" /> Pick
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center text-lg font-bold ${style.text} group-hover:scale-110 transition-transform`}>
                                            {tool.name[0]}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1 italic">"{tool.description}"</p>
                                    <div className="mt-auto pt-4 border-t border-white/5">
                                        <Button size="sm" variant="ghost" className={`w-full hover:${style.bg} hover:${style.text} transition-colors group-hover:translate-x-1`} asChild>
                                            <Link href={`/directory/tool/${tool.slug}`} className="flex items-center justify-center gap-2">
                                                View Details <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 glass rounded-xl">
                            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
                            <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </section>
            ) : null}

            {/* Courses Section */}
            {courses.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold">Related Courses</h2>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${style.bg} ${style.text}`}>{courses.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <Link 
                                key={course.id} 
                                href={`/courses/${course.slug}`}
                                className="glass-card p-6 hover:-translate-y-1 transition-all group"
                            >
                                <span className="text-xs text-primary font-medium">{course.provider}</span>
                                <h3 className="font-bold text-lg mt-2 group-hover:text-primary transition-colors">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs bg-secondary/50 px-2 py-1 rounded">{course.level}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Resources Section */}
            {resources.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold">Resources</h2>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${style.bg} ${style.text}`}>{resources.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.map(resource => (
                            <Link 
                                key={resource.id} 
                                href={`/resources/${resource.slug}`}
                                className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center text-lg font-bold ${style.text}`}>
                                    {resource.title[0]}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-primary transition-colors">{resource.title}</h3>
                                    <span className="text-xs text-muted-foreground">{resource.type}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    </div>
    </>
  );
}
