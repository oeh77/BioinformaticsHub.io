import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { getCategoryStyle } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon, Database, GraduationCap, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const { q: query } = await Promise.resolve(searchParams);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
        <h1 className="text-3xl font-bold mb-4">No search query provided</h1>
        <p className="text-muted-foreground mb-8 text-lg">Enter a search term in the header to find bioinformatics tools and resources.</p>
        <Link href="/directory">
          <Button variant="outline" className="rounded-full">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  // Perform search across all models
  const [tools, courses, posts, resources] = await Promise.all([
    prisma.tool.findMany({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
        published: true,
      },
      include: { category: true }
    }),
    prisma.course.findMany({
      where: {
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
        published: true,
      },
      include: { category: true }
    }),
    prisma.post.findMany({
      where: {
        OR: [{ title: { contains: query } }, { excerpt: { contains: query } }],
        published: true,
      },
      include: { category: true }
    }),
    prisma.resource.findMany({
      where: {
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      },
      include: { category: true }
    }),
  ]);

  const totalResults = tools.length + courses.length + posts.length + resources.length;

  return (
    <>
      <PageHeader 
        title={<>Search <span className="text-primary italic">Results</span></>}
        subtitle={`Found ${totalResults} results for "${query}" across the platform.`}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar (Mock) */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SearchIcon className="w-4 h-4 text-primary" /> Filter Results
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Tools</span>
                  <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md">{tools.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Courses</span>
                  <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Articles</span>
                  <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Resources</span>
                  <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md">{resources.length}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full text-xs text-primary h-8" disabled>
                More Filters Coming Soon
              </Button>
            </div>
          </aside>

          {/* Results List */}
          <main className="lg:col-span-3 space-y-12">
            {totalResults === 0 ? (
              <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed border-white/10">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">No matches found</h2>
                <p className="text-muted-foreground">Try adjusting your search terms or browsing categories.</p>
              </div>
            ) : (
              <>
                {/* Tools Section */}
                {tools.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                      <Database className="w-5 h-5 text-emerald-500" /> Software & Tools
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
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{tool.description}</p>
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

                {/* Blog Section */}
                {posts.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                      <FileText className="w-5 h-5 text-blue-500" /> Articles & Insights
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
