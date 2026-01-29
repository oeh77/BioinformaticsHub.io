"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  GitBranch, 
  Dna, 
  BarChart3, 
  FileText, 
  Search,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Workflow templates organized by category
const WORKFLOW_TEMPLATES = [
  {
    id: "rna-seq-basic",
    name: "RNA-Seq Analysis Pipeline",
    description: "Standard RNA-seq workflow with quality control, alignment, and differential expression analysis.",
    category: "Transcriptomics",
    icon: Dna,
    difficulty: "Intermediate",
    estimatedTime: "2-4 hours",
    tools: ["FastQC", "STAR", "featureCounts", "DESeq2"],
    steps: 6,
    uses: 1250,
  },
  {
    id: "variant-calling",
    name: "Variant Calling Pipeline",
    description: "Germline variant discovery from WGS/WES data using GATK best practices.",
    category: "Genomics",
    icon: GitBranch,
    difficulty: "Advanced",
    estimatedTime: "4-8 hours",
    tools: ["BWA", "GATK", "Picard", "VEP"],
    steps: 8,
    uses: 890,
  },
  {
    id: "chip-seq",
    name: "ChIP-Seq Analysis",
    description: "Peak calling and annotation workflow for chromatin immunoprecipitation sequencing data.",
    category: "Epigenomics",
    icon: BarChart3,
    difficulty: "Intermediate",
    estimatedTime: "3-5 hours",
    tools: ["Bowtie2", "MACS2", "deepTools", "HOMER"],
    steps: 5,
    uses: 675,
  },
  {
    id: "metagenomics-16s",
    name: "16S Metagenomics",
    description: "Microbial community analysis from 16S rRNA amplicon sequencing data.",
    category: "Metagenomics",
    icon: Sparkles,
    difficulty: "Beginner",
    estimatedTime: "1-2 hours",
    tools: ["DADA2", "QIIME2", "phyloseq"],
    steps: 4,
    uses: 1580,
  },
  {
    id: "scrna-seq",
    name: "Single-Cell RNA-Seq",
    description: "scRNA-seq analysis including clustering, marker identification, and trajectory inference.",
    category: "Single Cell",
    icon: Dna,
    difficulty: "Advanced",
    estimatedTime: "4-6 hours",
    tools: ["Cell Ranger", "Seurat", "Scanpy", "Monocle"],
    steps: 7,
    uses: 920,
  },
  {
    id: "proteomics-quant",
    name: "Quantitative Proteomics",
    description: "Mass spectrometry-based proteomics workflow with label-free quantification.",
    category: "Proteomics",
    icon: BarChart3,
    difficulty: "Intermediate",
    estimatedTime: "2-3 hours",
    tools: ["MaxQuant", "Perseus", "MSstats"],
    steps: 5,
    uses: 430,
  },
  {
    id: "atac-seq",
    name: "ATAC-Seq Pipeline",
    description: "Chromatin accessibility analysis from ATAC-seq experiments.",
    category: "Epigenomics",
    icon: FileText,
    difficulty: "Intermediate",
    estimatedTime: "3-4 hours",
    tools: ["Bowtie2", "MACS2", "deepTools", "ATACseqQC"],
    steps: 6,
    uses: 510,
  },
  {
    id: "genome-assembly",
    name: "De Novo Genome Assembly",
    description: "Assemble genomes from long-read sequencing data with quality assessment.",
    category: "Genomics",
    icon: GitBranch,
    difficulty: "Advanced",
    estimatedTime: "6-12 hours",
    tools: ["Flye", "Medaka", "QUAST", "BUSCO"],
    steps: 5,
    uses: 340,
  },
];

const CATEGORIES = [
  "All",
  "Genomics",
  "Transcriptomics",
  "Epigenomics",
  "Metagenomics",
  "Single Cell",
  "Proteomics",
];

export default function WorkflowTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Workflow Templates</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Start with pre-built bioinformatics pipelines designed by experts. 
          Customize them to fit your research needs.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {template.uses.toLocaleString()} uses
                  </span>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Difficulty:</span>
                  <Badge 
                    variant="secondary"
                    className={
                      template.difficulty === "Beginner" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                      template.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }
                  >
                    {template.difficulty}
                  </Badge>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tools.slice(0, 3).map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {template.tools.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tools.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Action */}
                <Button className="w-full group-hover:bg-primary/90" asChild>
                  <Link href={`/workflows/new?template=${template.id}`}>
                    Use Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Can&apos;t find what you need?</h3>
            <p className="text-muted-foreground">
              Build your own custom workflow from scratch using our visual builder.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/workflows/new">
              <GitBranch className="h-5 w-5 mr-2" />
              Create Custom Workflow
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
