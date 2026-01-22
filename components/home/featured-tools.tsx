import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export async function FeaturedTools() {
  // Fetch featured tools from database
  const featuredTools = await prisma.tool.findMany({
    where: { featured: true },
    take: 4,
    include: {
      category: true,
    },
  });

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Bioinformatics Tools</h2>
          <p className="text-muted-foreground">Editor's picks for high-impact research software.</p>
        </div>
        <Link href="/directory" className="text-primary hover:underline flex items-center text-sm font-medium">
            View all tools <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredTools.map((tool) => (
            <div key={tool.id} className="glass-card p-6 flex flex-col hover:shadow-lg transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {tool.name[0]}
                    </div>
                    {tool.featured && (
                        <span className="bg-yellow-500/10 text-yellow-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-current" /> Pick
                        </span>
                    )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/directory/tool/${tool.slug}`}>{tool.name}</Link>
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {tool.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground">
                        {tool.category.name}
                    </span>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-auto glass hover:bg-primary hover:text-white" asChild>
                    <Link href={`/directory/tool/${tool.slug}`}>View Tool</Link>
                </Button>
            </div>
        ))}
      </div>
    </section>
  );
}
