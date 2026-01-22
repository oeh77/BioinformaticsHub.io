import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Clock, ExternalLink, Share2, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyle, getCategoryImage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { BookmarkButton } from "@/components/bookmark-button";

// Force dynamic
export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!tool) {
    notFound();
  }

  // Find related tools
  const relatedTools = await prisma.tool.findMany({
    where: { 
        categoryId: tool.categoryId,
        id: { not: tool.id }
    },
    take: 3
  });

  const style = getCategoryStyle(tool.category.slug);
  const bgImage = getCategoryImage(tool.category.slug);

  return (
    <>
      {/* Use PageHeader for consistency and search bar */}
      <PageHeader 
         title={tool.name}
         subtitle={`A powerful tool for ${tool.category.name}`}
         backgroundImage={bgImage}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/directory" className="hover:text-primary transition-colors">Directory</Link>
            <span className="opacity-50">/</span>
            <Link href={`/directory/${tool.category.slug}`} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${style.bg.replace('/10','')}`}></span>
                {tool.category.name}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-foreground font-medium">{tool.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                <div className={`glass-card p-10 rounded-3xl border-t-4 ${style.border.replace('/20', '')} shadow-2xl relative overflow-hidden`}>
                    {/* Background Decor */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${style.bg.replace('bg-', 'from-').replace('/10','/5')} to-transparent rounded-bl-full pointer-events-none`} />

                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                                    {tool.category.name}
                                </span>
                                {tool.pricing && (
                                    <span className="bg-secondary/50 backdrop-blur-md text-secondary-foreground border border-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                                        {tool.pricing}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{tool.name}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">{tool.description}</p>
                        </div>
                    
                        <div className={`w-20 h-20 rounded-2xl ${style.bg} flex items-center justify-center text-4xl font-bold ${style.text} shadow-inner shrink-0`}>
                            {tool.name[0]}
                        </div>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl leading-8" 
                        dangerouslySetInnerHTML={{ __html: tool.content || `<p>${tool.description}</p>` }} 
                    />
                    
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                        <Button size="lg" className={`rounded-full shadow-lg ${style.glow} hover:shadow-xl transition-shadow`} asChild>
                            <Link href="#" className="flex items-center">
                                Visit Website <ExternalLink className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                        <BookmarkButton itemType="TOOL" itemId={tool.id} />
                        <Button variant="outline" size="lg" className="rounded-full glass hover:bg-white/10">
                            <Share2 className="mr-2 w-4 h-4" /> Share Tool
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Meta Info */}
                <div className="glass p-8 rounded-2xl space-y-6 shadow-lg">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary"/> Tool Details
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                            <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Updated</span>
                            <span className="font-medium">{new Date(tool.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                            <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> License</span>
                            <span className="font-medium">Open Source (MIT)</span>
                        </div>
                    </div>
                </div>

                {/* Related Tools */}
                {relatedTools.length > 0 && (
                    <div className="glass p-8 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg mb-6">Similar Alternatives</h3>
                        <div className="space-y-5">
                            {relatedTools.map(related => (
                                <Link key={related.id} href={`/directory/tool/${related.slug}`} className="flex items-start gap-4 group">
                                    <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center ${style.text} font-bold text-sm shrink-0 group-hover:scale-110 transition-transform`}>
                                        {related.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold group-hover:text-primary transition-colors">{related.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{related.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
}
