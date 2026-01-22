import Link from "next/link";
import { ArrowRight, Code2, Database, Terminal, BookOpenCheck, Cpu, GitBranch } from "lucide-react";

export function GettingStartedSection() {
  const learningRoadmap = [
    {
      step: 1,
      icon: Code2,
      title: "Master Programming Fundamentals",
      description: "Start with Python—the most versatile language in bioinformatics. Learn data structures, file handling, and basic algorithms. Python's Biopython library provides tools for sequence analysis, BLAST searching, and accessing biological databases.",
      skills: ["Python basics", "Data structures", "File I/O", "Biopython library"],
      timeEstimate: "4-6 weeks",
      color: "from-blue-500 to-blue-600"
    },
    {
      step: 2,
      icon: Terminal,
      title: "Learn Linux & Command Line",
      description: "Most bioinformatics tools run on Linux/Unix systems. Master bash scripting, file manipulation, and remote server access. You'll need these skills for running NGS pipelines and working with HPC clusters.",
      skills: ["Bash scripting", "SSH & servers", "File processing", "Job schedulers"],
      timeEstimate: "2-4 weeks",
      color: "from-green-500 to-green-600"
    },
    {
      step: 3,
      icon: Database,
      title: "Understand Biological Databases",
      description: "Navigate essential resources like NCBI, UniProt, Ensembl, and KEGG. Learn to query databases programmatically, understand file formats (FASTA, FASTQ, BAM, VCF), and retrieve data for your analyses.",
      skills: ["NCBI tools", "UniProt queries", "File formats", "API access"],
      timeEstimate: "2-3 weeks",
      color: "from-orange-500 to-orange-600"
    },
    {
      step: 4,
      icon: BookOpenCheck,
      title: "Statistical Analysis with R",
      description: "R and Bioconductor are essential for statistical genomics. Master differential expression analysis with DESeq2/edgeR, create publication-quality visualizations with ggplot2, and perform pathway enrichment analyses.",
      skills: ["R programming", "Bioconductor", "Statistics", "Data visualization"],
      timeEstimate: "4-6 weeks",
      color: "from-purple-500 to-purple-600"
    },
    {
      step: 5,
      icon: GitBranch,
      title: "Build Real Pipelines",
      description: "Create reproducible analysis workflows using Nextflow or Snakemake. Learn containerization with Docker/Singularity, version control with Git, and how to write clean, documented, maintainable code.",
      skills: ["Nextflow/Snakemake", "Docker", "Git", "Documentation"],
      timeEstimate: "3-4 weeks",
      color: "from-pink-500 to-pink-600"
    },
    {
      step: 6,
      icon: Cpu,
      title: "Apply Machine Learning",
      description: "Leverage AI for biological insights. Use scikit-learn for classical ML, deep learning frameworks for sequence analysis, and understand how to apply models to predict drug targets, classify variants, or analyze images.",
      skills: ["scikit-learn", "Deep learning", "Feature engineering", "Model evaluation"],
      timeEstimate: "4-8 weeks",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-20 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          Your Learning Journey
        </span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          How to Get Started in Bioinformatics
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Whether you're a wet-lab scientist looking to analyze your own data or a computer scientist 
          entering biology, this roadmap will guide you from beginner to proficient bioinformatician 
          in 6-12 months of dedicated study.
        </p>
      </div>

      {/* Learning Path Timeline */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-cyan-500 hidden md:block" />
          
          <div className="space-y-8">
            {learningRoadmap.map((item, idx) => (
              <div key={idx} className="relative flex gap-6 md:gap-12">
                {/* Step indicator */}
                <div className="relative z-10 hidden md:block">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Content card */}
                <div className="flex-1 glass-card p-6 md:p-8 hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-4 mb-4 md:hidden">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Step {item.step}</span>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                  </div>
                  
                  <div className="hidden md:block mb-4">
                    <span className="text-sm text-muted-foreground">Step {item.step}</span>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map((skill, sidx) => (
                        <span 
                          key={sidx}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ⏱️ {item.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Essential Tools Preview */}
      <div className="glass-card p-8 md:p-12 mb-16">
        <h3 className="text-2xl font-bold text-center mb-8">Essential Bioinformatics Tools You'll Master</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Python", category: "Programming" },
            { name: "R / Bioconductor", category: "Statistics" },
            { name: "BLAST", category: "Alignment" },
            { name: "BWA / STAR", category: "Mapping" },
            { name: "GATK", category: "Variants" },
            { name: "DESeq2", category: "RNA-seq" },
            { name: "Nextflow", category: "Workflows" },
            { name: "Docker", category: "Containers" },
            { name: "Galaxy", category: "Platform" },
            { name: "IGV", category: "Visualization" },
            { name: "Cytoscape", category: "Networks" },
            { name: "AlphaFold", category: "Structure" }
          ].map((tool, idx) => (
            <div key={idx} className="glass-card p-4 text-center hover:border-primary/50 transition-colors">
              <div className="font-semibold text-sm">{tool.name}</div>
              <div className="text-xs text-muted-foreground">{tool.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to Begin?</h3>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explore our curated courses, browse the tools directory, or dive into 
          our beginner-friendly tutorials. Your journey into bioinformatics starts here.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-colors"
          >
            Explore Tools Directory
          </Link>
        </div>
      </div>
    </section>
  );
}
