import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { FileText, Download, ExternalLink, Database, BookOpen, Video, FileCode, Layers, Globe, Lightbulb } from "lucide-react";
import { getCategoryImage } from "@/lib/utils";

export const dynamic = 'force-dynamic';

const resourceIcons: Record<string, any> = {
  'Dataset': Database,
  'Tutorial': BookOpen,
  'Video': Video,
  'Documentation': FileText,
  'Code': FileCode,
  'default': FileText
};

// Featured resource categories
const resourceCategories = [
  {
    title: "Biological Databases",
    description: "Access genomic, proteomic, and chemical databases essential for research.",
    icon: Database,
    examples: ["NCBI GenBank", "UniProt", "KEGG", "PDB"],
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Protocol Collections",
    description: "Step-by-step experimental and computational protocols.",
    icon: FileText,
    examples: ["NGS Library Prep", "ChIP-seq Protocol", "RNA Extraction"],
    color: "bg-green-500/10 text-green-500"
  },
  {
    title: "Sample Datasets",
    description: "Practice datasets for learning bioinformatics tools and workflows.",
    icon: Layers,
    examples: ["RNA-seq Counts", "VCF Examples", "FASTA Files"],
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Video Tutorials",
    description: "Visual guides for complex bioinformatics concepts and tools.",
    icon: Video,
    examples: ["Galaxy Basics", "R Programming", "Linux CLI"],
    color: "bg-orange-500/10 text-orange-500"
  }
];

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // Group resources by type
  const resourcesByType = resources.reduce((acc, resource) => {
    const type = resource.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, typeof resources>);

  const types = Object.keys(resourcesByType);

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Bioinformatics Resources"
        subtitle="Datasets, tutorials, documentation, and more to power your research."
        backgroundImage={getCategoryImage('resources')}
      />

      {/* Introduction Section */}
      <section className="py-16 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Everything You Need for Bioinformatics Research
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From reference datasets to comprehensive tutorials, our resource library supports 
              every stage of your bioinformatics journey. Access curated databases, download 
              practice datasets, follow detailed protocols, and watch expert-led video tutorials. 
              All resources are organized by type and topic for easy discovery.
            </p>
          </div>

          {/* Resource Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">{resources.length}+</div>
              <div className="text-sm text-muted-foreground">Total Resources</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">{types.length}</div>
              <div className="text-sm text-muted-foreground">Resource Types</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Free Access</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">Weekly</div>
              <div className="text-sm text-muted-foreground">New Additions</div>
            </div>
          </div>

          {/* Resource Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceCategories.map((cat, idx) => (
              <div key={idx} className="glass-card p-6 hover:border-primary/50 transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.examples.slice(0, 2).map((ex, eidx) => (
                    <span key={eidx} className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filter by Type */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-full glass border border-primary bg-primary/10 text-primary font-medium">
            All Types
          </button>
          {types.map(type => (
            <button 
              key={type}
              className="px-4 py-2 rounded-full glass border border-white/20 hover:border-primary hover:bg-primary/5 transition-all font-medium"
            >
              {type}
            </button>
          ))}
        </div>

        {resources.length > 0 ? (
          <>
            {/* Resources by Type */}
            {types.map(type => {
              const typeResources = resourcesByType[type];
              const Icon = resourceIcons[type] || resourceIcons.default;

              return (
                <div key={type} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">{type}</h2>
                    <span className="text-sm text-muted-foreground">({typeResources.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeResources.map((resource) => {
                      const ResourceIcon = resourceIcons[resource.type] || resourceIcons.default;

                      return (
                        <Link 
                          key={resource.id}
                          href={`/resources/${resource.slug}`}
                          className="glass-card rounded-2xl p-6 group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-white/10"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <ResourceIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {resource.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                            {resource.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            {resource.category && (
                              <span className="text-xs text-primary font-semibold">
                                {resource.category.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              View Resource
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <Lightbulb className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Resources Coming Soon</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We&apos;re compiling a comprehensive library of bioinformatics resources. 
              Soon you&apos;ll find datasets, protocols, tutorials, and documentation here.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="glass-card p-4">
                <Database className="w-8 h-8 text-blue-500 mb-3" />
                <h4 className="font-bold mb-2">Database Links</h4>
                <p className="text-sm text-muted-foreground">
                  Direct access to NCBI, Ensembl, UniProt, KEGG, and other essential databases.
                </p>
              </div>
              <div className="glass-card p-4">
                <FileCode className="w-8 h-8 text-green-500 mb-3" />
                <h4 className="font-bold mb-2">Sample Scripts</h4>
                <p className="text-sm text-muted-foreground">
                  Ready-to-use Python and R scripts for common bioinformatics tasks.
                </p>
              </div>
              <div className="glass-card p-4">
                <Video className="w-8 h-8 text-purple-500 mb-3" />
                <h4 className="font-bold mb-2">Video Guides</h4>
                <p className="text-sm text-muted-foreground">
                  Step-by-step video tutorials from basic to advanced topics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* External Resources CTA */}
        <section className="mt-16">
          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Essential External Resources</h3>
                <p className="text-muted-foreground mb-6">
                  Beyond our curated collection, the bioinformatics community offers numerous 
                  valuable resources. Here are some we recommend:
                </p>
                <div className="space-y-3">
                  {[
                    { name: "NCBI Resources", url: "https://www.ncbi.nlm.nih.gov/", desc: "Genomic databases and tools" },
                    { name: "Bioconductor", url: "https://bioconductor.org/", desc: "R packages for genomics" },
                    { name: "Galaxy Project", url: "https://usegalaxy.org/", desc: "Web-based analysis platform" },
                    { name: "EMBL-EBI Training", url: "https://www.ebi.ac.uk/training/", desc: "Free online courses" }
                  ].map((ext, idx) => (
                    <a 
                      key={idx}
                      href={ext.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 glass rounded-xl hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium group-hover:text-primary transition-colors">{ext.name}</div>
                          <div className="text-xs text-muted-foreground">{ext.desc}</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop"
                  alt="Scientific databases and research resources"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
