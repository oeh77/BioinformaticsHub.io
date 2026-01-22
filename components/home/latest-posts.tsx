import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCategoryStyle } from "@/lib/utils";

export async function LatestPosts() {
  // Fetch latest published blog posts from database
  const posts = await prisma.post.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
  });

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Latest from the Blog</h2>
          <p className="text-muted-foreground">Stay updated with the latest insights and tutorials.</p>
        </div>
        <Link href="/blog" className="text-primary hover:underline flex items-center text-sm font-medium">
            View all posts <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const categoryStyle = getCategoryStyle(post.category.name);
          const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });

          return (
            <article key={post.id} className="glass-card overflow-hidden flex flex-col hover:shadow-xl transition-all group hover:-translate-y-1">
              {/* Category badge header */}
              <div className={`h-2 ${categoryStyle.gradient}`} />
              
              <div className="p-6 flex flex-col flex-1">
                {/* Category and reading time */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
                    {post.category.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>5 min read</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Author and date */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span>Bioinformatics Hub</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={post.createdAt.toISOString()}>{formattedDate}</time>
                  </div>
                </div>
              </div>

              {/* Read more button ... remains same */}
              <div className="px-6 pb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full glass hover:bg-primary hover:text-white" 
                  asChild
                >
                  <Link href={`/blog/${post.slug}`}>
                    Read Article <ArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
