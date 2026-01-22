import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Filter, Grid, Wrench, Database, Dna, FlaskConical, Brain, Microscope, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryStyle, getCategoryImage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

// Tool categories with descriptions
const toolCategoryInfo = [
  {
    name: "Sequence Alignment",
    description: "Tools like BLAST, BWA, and Bowtie for aligning DNA/RNA sequences to reference genomes.",
    icon: Dna,
    color: "text-blue-500"
  },
  {
    name: "NGS Analysis",
    description: "Process raw sequencing data from Illumina, PacBio, and Oxford Nanopore platforms.",
    icon: BarChart3,
    color: "text-green-500"
  },
  {
    name: "Variant Calling",
    description: "Identify SNPs, indels, and structural variants with GATK, DeepVariant, and more.",
    icon: Target,
    color: "text-red-500"
  },
  {
    name: "RNA-Seq",
    description: "Quantify gene expression, perform differential analysis with DESeq2, edgeR, and Salmon.",
    icon: FlaskConical,
    color: "text-purple-500"
  },
  {
    name: "Proteomics",
    description: "Analyze mass spectrometry data, predict protein structures with AlphaFold and MaxQuant.",
    icon: Microscope,
    color: "text-orange-500"
  },
  {
    name: "Machine Learning",
    description: "Apply AI/ML to biological data for classification, prediction, and pattern discovery.",
    icon: Brain,
    color: "text-cyan-500"
  }
];

export default async function DirectoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { tools: true } } }
  });

  const featuredTools = await prisma.tool.findMany({
    where: { featured: true },
    take: 6,
    include: { category: true }
  });
  
  const totalTools = categories.reduce((acc, c) => acc + c._count.tools, 0);

  return (
    <div className="min-h-screen">
      <PageHeader
         title={<>Bioinformatics <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Tools Directory</span></>}
         subtitle={`Explore our curated collection of ${totalTools}+ cutting-edge workflows, libraries, and platforms. Filter by category, pricing, or research field.`}
         backgroundImage="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=2670&auto=format&fit=crop"
      />

      {/* Directory Introduction */}
      <section className="py-16 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              The Most Comprehensive Bioinformatics Tool Database
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From sequence alignment to machine learning, our directory catalogs the essential 
              software used in modern computational biology. Each tool is carefully reviewed 
              and categorized, with detailed information about features, pricing, and use cases. 
              Whether you're analyzing NGS data, calling variants, or predicting protein structures, 
              find the right tool for your research.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">{totalTools}+</div>
              <div className="text-sm text-muted-foreground">Curated Tools</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Free & Open Source</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">Weekly</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
          </div>

          {/* Tool Categories Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {toolCategoryInfo.map((cat, idx) => (
              <div key={idx} className="glass-card p-4 text-center hover:border-primary/50 transition-all cursor-pointer group">
                <cat.icon className={`w-8 h-8 mx-auto mb-3 ${cat.color} group-hover:scale-110 transition-transform`} />
                <h4 className="font-semibold text-sm mb-1">{cat.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        
        {/* Featured Grid */}
        <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Grid className="w-5 h-5" />
                </div>
                Featured Tools
            </h2>
            
            {featuredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map(tool => {
                  const style = getCategoryStyle(tool.category.slug);
                  return (
                      <Link key={tool.id} href={`/directory/tool/${tool.slug}`} className="glass-card p-6 block hover:-translate-y-1 transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                                  {tool.category.name}
                              </span>
                              {tool.pricing === 'Paid' && <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">$</span>}
                          </div>
                          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                      </Link>
                  )
              })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Wrench className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <h3 className="text-xl font-bold mb-4">Tools Coming Soon</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our directory is being populated with carefully curated bioinformatics tools. 
                  Featured tools including BLAST, BWA, GATK, Galaxy, DESeq2, and more will appear here shortly.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["BLAST", "BWA", "STAR", "GATK", "DESeq2", "Salmon", "Galaxy", "Nextflow"].map(tool => (
                    <span key={tool} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link href="/directory/tools">
                <Button size="lg" className="rounded-full">
                  View All Tools <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
        </section>

        {/* Why Use Our Directory */}
        <section className="mb-16">
          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">Why Use Our Directory?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Expert Curation</h4>
                      <p className="text-muted-foreground text-sm">
                        Every tool is reviewed by experienced bioinformaticians who understand 
                        real-world research workflows.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Practical Comparisons</h4>
                      <p className="text-muted-foreground text-sm">
                        Head-to-head comparisons help you choose between similar tools like 
                        BLAST vs BWA or DESeq2 vs edgeR.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Up-to-Date Information</h4>
                      <p className="text-muted-foreground text-sm">
                        We regularly update entries with new features, version changes, 
                        and community feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop"
                  alt="Bioinformatics research laboratory"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                        <Filter className="w-5 h-5" />
                    </div>
                    Browse by Category
                </h2>
            </div>
            
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map(cat => {
                      const style = getCategoryStyle(cat.slug);
                      return (
                          <Link key={cat.id} href={`/directory/${cat.slug}`} 
                              className={`glass p-5 rounded-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] border border-transparent hover:${style.border} ${style.glow} hover:shadow-lg group shadow-sm bg-secondary/5`}>
                              <div className="flex items-center gap-3">
                                  <div className={`w-2 h-10 rounded-full ${style.bg.replace('/10', '')} transition-all group-hover:h-12`}/>
                                  <div>
                                      <h3 className="font-semibold group-hover:text-foreground transition-colors">{cat.name}</h3>
                                      <p className="text-xs text-muted-foreground group-hover:text-foreground/70">{cat._count.tools} tools</p>
                                  </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                  <ArrowRight className="w-4 h-4" />
                              </div>
                          </Link>
                      )
                  })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Database className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <h3 className="text-xl font-bold mb-4">Categories Being Organized</h3>
                <p className="text-muted-foreground mb-6">
                  Tool categories will appear here as we organize our comprehensive directory.
                </p>
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
