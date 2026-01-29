
import Link from 'next/link';
import { PageHeader } from "@/components/ui/page-header";
import { 
  BookOpen, 
  Code, 
  Dna, 
  Network, 
  Server, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "Learning Paths | BioinformaticsHub",
  description: "Curated learning paths for bioinformatics, from beginner to advanced roles.",
};

interface LearningStep {
  title: string;
  description: string;
  resources: Array<{ name: string; url: string }>;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  icon: any;
  color: string;
  steps: LearningStep[];
}

const learningPaths: LearningPath[] = [
  {
    id: "beginner-foundation",
    title: "Bioinformatics Foundations",
    description: "Start here if you have a biology background and want to learn computational skills, or vice versa.",
    level: "Beginner",
    icon: GraduationCap,
    color: "text-green-500 bg-green-500/10",
    steps: [
      {
        title: "1. Core Biology & Genetics",
        description: "Understand the Central Dogma, DNA structure, and basic genetics.",
        resources: [
          { name: "Khan Academy Biology", url: "https://www.khanacademy.org/science/biology" },
          { name: "Molecular Biology of the Cell", url: "https://www.ncbi.nlm.nih.gov/books/NBK21054/" }
        ]
      },
      {
        title: "2. Linux & Command Line",
        description: "Master the terminal, file manipulation, and bash scripting.",
        resources: [
          { name: "Command Line Bootcamp", url: "https://ubuntu.com/tutorials/command-line-for-beginners" },
          { name: "Rosalind: Python Village", url: "https://rosalind.info/problems/list-view/?location=python-village" }
        ]
      },
      {
        title: "3. Python or R Programming",
        description: "Learn a scripting language for data analysis.",
        resources: [
          { name: "Python for Biologists", url: "https://pythonforbiologists.com/" },
          { name: "Bioinformatics with Python (Coursera)", url: "https://www.coursera.org/learn/bioinformatics" }
        ]
      }
    ]
  },
  {
    id: "genomic-analyst",
    title: "Genomic Data Analyst",
    description: "Master the skills needed to analyze NGS data, variants, and gene expression.",
    level: "Intermediate",
    icon: Dna,
    color: "text-blue-500 bg-blue-500/10",
    steps: [
      {
        title: "1. NGS Fundamentals",
        description: "FASTQ formats, quality control (FastQC), and trimming.",
        resources: [
          { name: "Galaxy Project Tutorials", url: "https://training.galaxyproject.org/" }
        ]
      },
      {
        title: "2. Alignment & Variant Calling",
        description: "Mapping reads (BWA, Bowtie2) and identifying mutations (GATK).",
        resources: [
          { name: "GATK Best Practices", url: "https://gatk.broadinstitute.org/hc/en-us" }
        ]
      },
      {
        title: "3. RNA-Seq Analysis",
        description: "Differential expression analysis using R (DESeq2, edgeR).",
        resources: [
          { name: "RNA-seqlopedia", url: "https://rnaseq.uoregon.edu/" }
        ]
      }
    ]
  },
  {
    id: "computational-biologist",
    title: "Computational Biologist / Developer",
    description: "Build tools, pipelines, and algorithms for biological data.",
    level: "Advanced",
    icon: Code,
    color: "text-purple-500 bg-purple-500/10",
    steps: [
      {
        title: "1. Algorithm Design",
        description: "Dynamic programming, graph theory, and string algorithms.",
        resources: [
          { name: "Algorithms for DNA Sequencing", url: "https://www.coursera.org/learn/dna-sequencing" }
        ]
      },
      {
        title: "2. Workflow Managers",
        description: "Scalable pipelines with Nextflow or Snakemake.",
        resources: [
          { name: "Nextflow Training", url: "https://www.nextflow.io/docs/latest/index.html" }
        ]
      },
      {
        title: "3. Cloud & Containerization",
        description: "Docker, Singularity, and AWS/Google Cloud Life Sciences.",
        resources: [
          { name: "Biocontainers", url: "https://biocontainers.pro/" }
        ]
      }
    ]
  },
  {
    id: "ai-bio-specialist",
    title: "AI in Biology Specialist",
    description: "Apply machine learning and deep learning to biological problems.",
    level: "Advanced",
    icon: Cpu,
    color: "text-orange-500 bg-orange-500/10",
    steps: [
      {
        title: "1. Machine Learning Basics",
        description: "Supervised/unsupervised learning, scikit-learn.",
        resources: [
          { name: "Machine Learning (Andrew Ng)", url: "https://www.coursera.org/specializations/machine-learning-introduction" }
        ]
      },
      {
        title: "2. Deep Learning for Bio",
        description: "Neural networks for sequence analysis (CNNs, RNNs, Transformers).",
        resources: [
          { name: "DeepCHEM", url: "https://deepchem.io/" }
        ]
      },
      {
        title: "3. Structural Biology & AlphaFold",
        description: "Protein structure prediction and interaction modeling.",
        resources: [
          { name: "AlphaFold Database", url: "https://alphafold.ebi.ac.uk/" }
        ]
      }
    ]
  }
];

export default function LearningPathsPage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Learning Paths"
        subtitle="Guided roadmaps to master bioinformatics skills, from beginner foundations to advanced specialization."
        backgroundImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {learningPaths.map((path) => {
            const Icon = path.icon;
            return (
              <div key={path.id} className="glass-card p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${path.color} flex items-center justify-center shadow-inner`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{path.title}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      path.level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                      path.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      {path.level}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-8 text-lg">
                  {path.description}
                </p>

                <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:h-[85%] before:w-0.5 before:bg-white/10">
                  {path.steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 pl-12 group">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-white/20 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all">
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">{idx + 1}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res, rIdx) => (
                          <Link 
                            key={rIdx} 
                            href={res.url} 
                            target="_blank"
                            className="text-xs flex items-center gap-1 text-primary hover:underline bg-primary/5 px-2 py-1 rounded border border-primary/20"
                          >
                            {res.name} <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <Link href="/courses">
                    <button className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      View Related Courses <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
