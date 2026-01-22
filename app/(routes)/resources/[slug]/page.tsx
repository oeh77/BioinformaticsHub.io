import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download, Database, BookOpen, Video, FileCode, Tag } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { getCategoryImage, getCategoryStyle } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

const resourceIcons: Record<string, any> = {
  'Dataset': Database,
  'Tutorial': BookOpen,
  'Video': Video,
  'Documentation': FileText,
  'Code': FileCode,
  'default': FileText
};

export default async function ResourcePage({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const resource = await prisma.resource.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!resource) {
    notFound();
  }

  // Find related resources
  const relatedResources = await prisma.resource.findMany({
    where: { 
      OR: [
        { categoryId: resource.categoryId },
        { type: resource.type }
      ],
      id: { not: resource.id }
    },
    take: 4
  });

  const style = resource.category ? getCategoryStyle(resource.category.slug) : getCategoryStyle('default');
  const bgImage = resource.category ? getCategoryImage(resource.category.slug) : getCategoryImage('default');
  const ResourceIcon = resourceIcons[resource.type] || resourceIcons.default;

  return (
    <>
      <PageHeader 
        title={resource.title}
        subtitle={`${resource.type} resource for bioinformatics research`}
        backgroundImage={bgImage}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
          <span className="opacity-50">/</span>
          <Link href={`/resources?type=${resource.type}`} className="hover:text-primary transition-colors">
            {resource.type}
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-foreground font-medium">{resource.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`glass-card p-10 rounded-3xl border-t-4 ${style.border.replace('/20', '')} shadow-2xl`}>
              {/* Resource Header */}
              <div className="flex items-start gap-6 mb-8">
                <div className={`w-20 h-20 rounded-2xl ${style.bg} flex items-center justify-center ${style.text} shadow-inner shrink-0`}>
                  <ResourceIcon className="w-10 h-10" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                      {resource.type}
                    </span>
                    {resource.category && (
                      <span className="bg-secondary/50 backdrop-blur-md text-secondary-foreground border border-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                        {resource.category.name}
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{resource.title}</h1>
                </div>
              </div>

              {/* Description */}
              <div className="prose dark:prose-invert prose-lg max-w-none mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Resource Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 glass rounded-2xl">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <div className="font-semibold">{resource.type}</div>
                </div>
                {resource.category && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Category</div>
                    <div className="font-semibold">{resource.category.name}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Added</div>
                  <div className="font-semibold">{new Date(resource.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="font-semibold text-green-500">Available</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <BookmarkButton itemType="RESOURCE" itemId={resource.id} />
                {resource.url ? (
                  <Button 
                    size="lg" 
                    className={`flex-1 rounded-full shadow-lg ${style.glow} hover:shadow-xl transition-shadow`}
                    asChild
                  >
                    <Link href={resource.url} target="_blank" className="flex items-center justify-center">
                      Access Resource <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-full"
                    disabled
                  >
                    URL Not Available
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full glass hover:bg-white/10"
                >
                  <Download className="mr-2 w-4 h-4" /> 
                  Download Info
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resource Info */}
            <div className="glass p-8 rounded-2xl space-y-6 shadow-lg">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Resource Details
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{resource.type}</span>
                </div>
                {resource.category && (
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{resource.category.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                  <span className="text-muted-foreground">Added</span>
                  <span className="font-medium">{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">Online</span>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div className="glass p-8 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-6">Related Resources</h3>
                <div className="space-y-5">
                  {relatedResources.map(related => {
                    const RelatedIcon = resourceIcons[related.type] || resourceIcons.default;
                    return (
                      <Link 
                        key={related.id} 
                        href={`/resources/${related.slug}`} 
                        className="flex items-start gap-4 group"
                      >
                        <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <RelatedIcon className={`w-5 h-5 ${style.text}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">{related.type}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
