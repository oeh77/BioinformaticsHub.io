import { Wrench, Dna, FileText, BarChart3, Scissors, Layers, Database } from "lucide-react";

export interface WorkflowTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: any;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
}

export const STANDARD_TOOLS: WorkflowTool[] = [
  // QC & Manipulation
  {
    id: "fastqc",
    name: "FastQC",
    description: "Quality control checks on raw sequence data",
    category: "Quality Control",
    icon: BarChart3,
    inputs: [{ name: "reads", type: "fastq" }],
    outputs: [{ name: "report", type: "html" }]
  },
  {
    id: "trimmomatic",
    name: "Trimmomatic",
    description: "Flexible read trimming tool for Illumina NGS data",
    category: "Quality Control",
    icon: Scissors,
    inputs: [{ name: "reads", type: "fastq" }],
    outputs: [{ name: "trimmed_reads", type: "fastq" }]
  },
  {
    id: "cutadapt",
    name: "Cutadapt",
    description: "Finds and removes adapter sequences, primers, poly-A tails",
    category: "Quality Control",
    icon: Scissors,
    inputs: [{ name: "reads", type: "fastq" }],
    outputs: [{ name: "trimmed_reads", type: "fastq" }]
  },

  // Alignment
  {
    id: "bowtie2",
    name: "Bowtie2",
    description: "Fast and sensitive read alignment",
    category: "Mapping",
    icon: Layers,
    inputs: [{ name: "reads", type: "fastq" }, { name: "index", type: "index" }],
    outputs: [{ name: "bam", type: "bam" }]
  },
  {
    id: "bwa-mem",
    name: "BWA-MEM",
    description: "Burrows-Wheeler Aligner for long and split reads",
    category: "Mapping",
    icon: Layers,
    inputs: [{ name: "reads", type: "fastq" }, { name: "index", type: "index" }],
    outputs: [{ name: "bam", type: "bam" }]
  },
  {
    id: "star",
    name: "STAR",
    description: "Spliced Transcripts Alignment to a Reference",
    category: "Mapping",
    icon: Layers,
    inputs: [{ name: "reads", type: "fastq" }, { name: "index", type: "index" }],
    outputs: [{ name: "bam", type: "bam" }]
  },
  {
    id: "hisat2",
    name: "HISAT2",
    description: "Graph-based alignment of next generation sequencing reads",
    category: "Mapping",
    icon: Layers,
    inputs: [{ name: "reads", type: "fastq" }, { name: "index", type: "index" }],
    outputs: [{ name: "bam", type: "bam" }]
  },

  // Variant Calling
  {
    id: "gatk-haplotypecaller",
    name: "GATK HaplotypeCaller",
    description: "Call germline SNPs and indels via local re-assembly",
    category: "Variant Calling",
    icon: Dna,
    inputs: [{ name: "bam", type: "bam" }, { name: "ref", type: "fasta" }],
    outputs: [{ name: "vcf", type: "vcf" }]
  },
  {
    id: "freebayes",
    name: "FreeBayes",
    description: "Bayesian haplotype-based polymorphism discovery",
    category: "Variant Calling",
    icon: Dna,
    inputs: [{ name: "bam", type: "bam" }, { name: "ref", type: "fasta" }],
    outputs: [{ name: "vcf", type: "vcf" }]
  },
  {
    id: "bcftools-call",
    name: "BCFtools Call",
    description: "SNP/indel variant calling from BCF/BAM",
    category: "Variant Calling",
    icon: Dna,
    inputs: [{ name: "pileup", type: "bcf" }],
    outputs: [{ name: "vcf", type: "vcf" }]
  },

  // RNA-Seq
  {
    id: "featurecounts",
    name: "featureCounts",
    description: "Count reads to genomic features",
    category: "RNA-Seq",
    icon: BarChart3,
    inputs: [{ name: "bam", type: "bam" }, { name: "annotation", type: "gtf" }],
    outputs: [{ name: "counts", type: "txt" }]
  },
  {
    id: "deseq2",
    name: "DESeq2",
    description: "Differential gene expression analysis",
    category: "RNA-Seq",
    icon: BarChart3,
    inputs: [{ name: "counts", type: "txt" }],
    outputs: [{ name: "results", type: "csv" }]
  },
  
  // Peak Calling
  {
    id: "macs2",
    name: "MACS2",
    description: "Model-based Analysis of ChIP-Seq",
    category: "ChIP-Seq",
    icon: BarChart3,
    inputs: [{ name: "bam", type: "bam" }],
    outputs: [{ name: "peaks", type: "bed" }]
  },

  // Tools common in Galaxy
  {
    id: "samtools-view",
    name: "Samtools View",
    description: "Filter, sort, and convert SAM/BAM/CRAM files",
    category: "SAM/BAM",
    icon: FileText,
    inputs: [{ name: "input", type: "sam/bam" }],
    outputs: [{ name: "output", type: "sam/bam" }]
  },
  {
    id: "bedtools-intersect",
    name: "BEDTools Intersect",
    description: "Report overlaps between two feature files",
    category: "Genomic Operations",
    icon: Dna,
    inputs: [{ name: "a", type: "bed" }, { name: "b", type: "bed" }],
    outputs: [{ name: "result", type: "bed" }]
  }
];
