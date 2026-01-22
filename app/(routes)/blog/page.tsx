import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, User as UserIcon, BookOpen, TrendingUp, Lightbulb, Dna, FlaskConical, Brain } from "lucide-react";

export const dynamic = 'force-dynamic';

// Featured blog topics
const featuredTopics = [
  {
    title: "Genomics & NGS",
    description: "Deep dives into next-generation sequencing, variant calling, and genome assembly workflows.",
    icon: Dna,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Machine Learning",
    description: "Applying AI and ML to biological data, from protein structure prediction to drug discovery.",
    icon: Brain,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Tool Reviews",
    description: "In-depth comparisons and tutorials for essential bioinformatics software and platforms.",
    icon: FlaskConical,
    color: "bg-green-500/10 text-green-500"
  },
  {
    title: "Career Insights",
    description: "Guidance on building a career in computational biology, from academia to industry.",
    icon: TrendingUp,
    color: "bg-orange-500/10 text-orange-500"
  }
];

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&auto=format&fit=crop"
            alt="Scientific research and data analysis"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Bioinformatics Insights
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn. Discover. <span className="text-primary">Innovate.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
              Stay at the forefront of computational biology with expert tutorials, industry news, 
              and practical guides. From NGS pipeline development to machine learning applications, 
              our articles help you master the tools and techniques shaping modern research.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{posts.length}+</div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25+</div>
                <div className="text-sm text-muted-foreground">Expert Authors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Monthly Readers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      <section className="py-12 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredTopics.map((topic, idx) => (
              <div key={idx} className="glass-card p-6 hover:border-primary/50 transition-all group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl ${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <topic.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              All Posts
            </button>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article key={post.id} className="glass-card flex flex-col overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                {/* Image */}
                <div className="h-48 bg-gradient-to-r from-secondary to-muted w-full relative overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{post.category.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>
                  
                  <Link href={`/blog/${post.slug}`} className="text-primary text-sm font-medium hover:underline inline-flex items-center">
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Lightbulb className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Coming Soon: Expert Bioinformatics Content</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              We&apos;re preparing in-depth tutorials on RNA-seq analysis, variant calling pipelines, 
              machine learning for genomics, and more. Subscribe to be notified when new content is published.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="glass-card p-4">
                <h4 className="font-bold mb-2">🧬 NGS Analysis</h4>
                <p className="text-sm text-muted-foreground">Complete guides to FastQ to variant calling pipelines</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-bold mb-2">📊 RNA-Seq Tutorials</h4>
                <p className="text-sm text-muted-foreground">DESeq2, edgeR, and pathway analysis walkthroughs</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-bold mb-2">🤖 ML in Biology</h4>
                <p className="text-sm text-muted-foreground">Apply deep learning to genomic and proteomic data</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
