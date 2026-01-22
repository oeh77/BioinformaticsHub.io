import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ToolPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Header Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/admin/tools/${id}/edit`}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
              </Link>
              <div className="h-6 w-px bg-yellow-500/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-400">PREVIEW MODE</span>
                {!tool.published && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                    Draft
                  </span>
                )}
                {tool.featured && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Featured
                  </span>
                )}
              </div>
            </div>
            {tool.url && (
              <Link href={tool.url} target="_blank">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article>
          {/* Category Badge */}
          <Link href={`/directory/${tool.category.slug}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              {tool.category.name}
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            {tool.name}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            {tool.pricing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{tool.pricing}</span>
              </div>
            )}
            {tool.url && (
              <Link
                href={tool.url}
                target="_blank"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Official Website</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Tool Image */}
          {tool.image && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-white/5">
              <img
                src={tool.image}
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="text-xl text-muted-foreground mb-8 pb-8 border-b border-white/10">
            {tool.description}
          </div>

          {/* Detailed Content */}
          {tool.content && (
            <div>
              <h2 className="text-2xl font-bold mb-4">About {tool.name}</h2>
              <div
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.content }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/admin/tools">
                <Button variant="ghost" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Tools
                </Button>
              </Link>
              <div className="flex gap-3">
                {tool.url && (
                  <Link href={tool.url} target="_blank">
                    <Button variant="outline" className="rounded-full">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Tool
                    </Button>
                  </Link>
                )}
                <Link href={`/admin/tools/${id}/edit`}>
                  <Button className="rounded-full">
                    Edit Tool
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
