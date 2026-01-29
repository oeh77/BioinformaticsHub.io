import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { getCategoryStyle } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon, Database, GraduationCap, FileText, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchSidebar } from "@/components/search/search-sidebar";

export const dynamic = 'force-dynamic';

export interface SearchFilters {
  type?: string[];
  category?: string[];
  pricing?: string[];
  sort?: string;
}

interface Props {
  searchParams: { q?: string; type?: string; category?: string; pricing?: string; sort?: string };
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const { q: query, type, category, pricing, sort } = await Promise.resolve(searchParams);

  if (!query) {
    return (
      <>
        <PageHeader 
          title={<>Search <span className="text-primary italic">BioinformaticsHub</span></>}
          subtitle="Find tools, courses, articles, jobs, and resources across the platform."
        />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar with search history and saved searches */}
            <aside className="lg:col-span-1">
              <SearchSidebar query="" />
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed border-white/10">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                <h1 className="text-3xl font-bold mb-4">Start Your Search</h1>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  Enter a search term in the header to find bioinformatics tools, courses, and resources.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/directory">
                    <Button variant="outline" className="rounded-full">Browse Tools Directory</Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="rounded-full">Explore Courses</Button>
                  </Link>
                  <Link href="/blog">
                    <Button variant="outline" className="rounded-full">Read Articles</Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // Parse filter arrays
  const typeFilters = type ? type.split(",") : [];
  const categoryFilters = category ? category.split(",") : [];
  const pricingFilters = pricing ? pricing.split(",") : [];

  // Build queries with filters
  const toolsQuery: any = {
    OR: [{ name: { contains: query } }, { description: { contains: query } }],
    published: true,
  };
  if (pricingFilters.length > 0) {
    toolsQuery.pricing = { in: pricingFilters };
  }
  if (categoryFilters.length > 0) {
    toolsQuery.category = { slug: { in: categoryFilters } };
  }

  // Perform search across all models
  const [tools, courses, posts, resources, jobs, categories] = await Promise.all([
    (!typeFilters.length || typeFilters.includes("tools")) 
      ? prisma.tool.findMany({
          where: toolsQuery,
          include: { category: true },
          orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { name: "asc" },
        })
      : Promise.resolve([]),
    (!typeFilters.length || typeFilters.includes("courses"))
      ? prisma.course.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
            published: true,
            ...(categoryFilters.length > 0 && { category: { slug: { in: categoryFilters } } }),
          },
          include: { category: true },
          orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { title: "asc" },
        })
      : Promise.resolve([]),
    (!typeFilters.length || typeFilters.includes("articles"))
      ? prisma.post.findMany({
          where: {
            OR: [{ title: { contains: query } }, { excerpt: { contains: query } }],
            published: true,
            ...(categoryFilters.length > 0 && { category: { slug: { in: categoryFilters } } }),
          },
          include: { category: true },
          orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { title: "asc" },
        })
      : Promise.resolve([]),
    (!typeFilters.length || typeFilters.includes("resources"))
      ? prisma.resource.findMany({
          where: {
            OR: [{ title: { contains: query } }, { description: { contains: query } }],
            ...(categoryFilters.length > 0 && { category: { slug: { in: categoryFilters } } }),
          },
          include: { category: true },
          orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { title: "asc" },
        })
      : Promise.resolve([]),
    (!typeFilters.length || typeFilters.includes("jobs"))
      ? prisma.job.findMany({
          where: {
            OR: [
              { title: { contains: query } }, 
              { company: { contains: query } },
              { description: { contains: query } },
            ],
            published: true,
          },
          orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { title: "asc" },
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalResults = tools.length + courses.length + posts.length + resources.length + jobs.length;

  // Build current filters for sidebar
  const currentFilters: SearchFilters = {
    type: typeFilters,
    category: categoryFilters,
    pricing: pricingFilters,
    sort: sort || "relevance",
  };

  return (
    <>
      <PageHeader 
        title={<>Search <span className="text-primary italic">Results</span></>}
        subtitle={`Found ${totalResults} results for "${query}" across the platform.`}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Enhanced Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <SearchSidebar 
              query={query} 
              filters={currentFilters}
              resultCounts={{
                tools: tools.length,
                courses: courses.length,
                articles: posts.length,
                resources: resources.length,
                jobs: jobs.length,
              }}
              categories={categories}
            />
          </aside>

          {/* Results List */}
          <main className="lg:col-span-3 space-y-12">
            {totalResults === 0 ? (
              <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed border-white/10">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">No matches found</h2>
                <p className="text-muted-foreground mb-6">Try adjusting your search terms or filters.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href={`/search?q=${encodeURIComponent(query)}`}>
                    <Button variant="outline" size="sm">Clear Filters</Button>
                  </Link>
                  <Link href="/directory">
                    <Button variant="outline" size="sm">Browse Directory</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Tools Section */}
                {tools.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                      <Database className="w-5 h-5 text-emerald-500" /> Software & Tools
                      <span className="text-sm font-normal text-muted-foreground ml-2">({tools.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tools.map(tool => {
                        const style = getCategoryStyle(tool.category.slug);
                        return (
                          <Link key={tool.id} href={`/directory/tool/${tool.slug}`} className="glass-card p-5 block hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                                    {tool.category.name}
                                </span>
                                {tool.pricing && (
                                  <span className="text-[10px] text-muted-foreground uppercase">{tool.pricing}</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tool.description}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Courses Section */}
                {courses.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-orange-500 pl-4">
                      <GraduationCap className="w-5 h-5 text-orange-500" /> Learning Paths
                      <span className="text-sm font-normal text-muted-foreground ml-2">({courses.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map(course => (
                        <Link key={course.id} href={`/courses/${course.slug}`} className="glass-card p-5 block hover:-translate-y-1 transition-all duration-300 group">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">{course.provider}</span>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">{course.level}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Jobs Section */}
                {jobs.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-cyan-500 pl-4">
                      <Briefcase className="w-5 h-5 text-cyan-500" /> Job Opportunities
                      <span className="text-sm font-normal text-muted-foreground ml-2">({jobs.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {jobs.map(job => (
                        <Link key={job.id} href={`/jobs/${job.slug}`} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl transition-all group">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">{job.company}</span>
                              <span className="text-[10px] text-cyan-500 uppercase">{job.locationType}</span>
                            </div>
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">{job.employmentType}</span>
                              <span className="text-xs text-muted-foreground">{job.location}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Blog Section */}
                {posts.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                      <FileText className="w-5 h-5 text-blue-500" /> Articles & Insights
                      <span className="text-sm font-normal text-muted-foreground ml-2">({posts.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {posts.map(post => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl transition-all group">
                          <div className="flex-1">
                             <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{post.title}</h3>
                             <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Resources Section */}
                {resources.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                      <BookOpen className="w-5 h-5 text-purple-500" /> Community Resources
                      <span className="text-sm font-normal text-muted-foreground ml-2">({resources.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {resources.map(res => (
                        <Link key={res.id} href={`/resources/${res.slug}`} className="glass p-5 rounded-2xl block hover:bg-white/5 transition-colors border border-white/5 group">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{res.type}</span>
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors mt-1">{res.title}</h4>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
