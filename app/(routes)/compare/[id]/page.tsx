import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, DollarSign, ExternalLink, Users, Star, Zap } from "lucide-react";
import { Metadata } from "next";

// Same comparison data - in production this would be in a database
const comparisons = [
  {
    id: "blast-vs-bwa",
    title: "BLAST vs BWA",
    category: "Sequence Alignment",
    description: "Compare the world's most used sequence similarity search tool with the leading short-read aligner.",
    detailedDescription: `When choosing between BLAST and BWA, understanding their fundamental purposes is essential. BLAST (Basic Local Alignment Search Tool) is designed for sequence similarity searching - finding regions of similarity between your query and sequences in massive databases. BWA (Burrows-Wheeler Aligner), on the other hand, excels at mapping short sequencing reads to a reference genome with high precision.

BLAST is your go-to tool when you have an unknown sequence and want to identify what it might be, find homologous genes across species, or explore evolutionary relationships. It's incredibly flexible and can handle both nucleotide and protein sequences.

BWA shines in NGS workflows where you need to accurately align millions of short reads to a reference genome. Its BWA-MEM algorithm is now the recommended approach for Illumina reads above 70bp, offering an excellent balance of speed and accuracy.`,
    verdict: "Choose BLAST for sequence similarity searches and database queries. Choose BWA for mapping NGS reads to reference genomes in variant calling or RNA-seq workflows.",
    tools: [
      {
        name: "BLAST",
        fullName: "Basic Local Alignment Search Tool",
        logo: "🔬",
        tagline: "Sequence Similarity Search",
        pricing: "Free",
        website: "https://blast.ncbi.nlm.nih.gov",
        developer: "NCBI",
        bestFor: "Finding homologous sequences",
        pros: ["Highly sensitive detection", "Protein & nucleotide support", "Large database searches", "Well-documented", "Web and local versions", "Multiple variants (BLASTN, BLASTP, BLASTX)"],
        cons: ["Not designed for read mapping", "Can be slow for very large queries", "Database dependency"],
        features: { "Sequence Search": true, "Read Mapping": false, "Variant Calling": false, "Open Source": true, "Web Interface": true, "Local Installation": true }
      },
      {
        name: "BWA",
        fullName: "Burrows-Wheeler Aligner",
        logo: "🧬",
        tagline: "Short-Read Aligner",
        pricing: "Free",
        website: "https://github.com/lh3/bwa",
        developer: "Heng Li",
        bestFor: "NGS read mapping",
        pros: ["High accuracy alignment", "BWA-MEM algorithm", "Widely adopted standard", "Efficient BWT indexing", "Active development", "Excellent documentation"],
        cons: ["Not for similarity searches", "Struggles with very long reads", "Command-line only"],
        features: { "Sequence Search": false, "Read Mapping": true, "Variant Calling": false, "Open Source": true, "Web Interface": false, "Local Installation": true }
      }
    ]
  },
  {
    id: "seurat-vs-scanpy",
    title: "Seurat vs Scanpy",
    category: "Single-Cell Analysis",
    description: "The battle of the single-cell giants: R vs Python.",
    detailedDescription: `Seurat and Scanpy are the two most popular toolkits for single-cell RNA-seq (scRNA-seq) analysis, and the choice often comes down to your preferred programming language.

Seurat, based in R, offers an incredibly rich ecosystem of tools for QC, analysis, and exploration. It pioneered many integration methods (the "anchor" method) and supports multimodal data (Cite-seq, Spatial). Its documentation and tutorials are world-class, making it accessible to biologists.

Scanpy, based in Python, is known for its scalability and efficiency. It uses the AnnData format and integrates seamlessly with the Python scientific stack (scikit-learn, PyTorch). It can handle millions of cells much faster than Seurat and is the foundation of the 'scverse' ecosystem.`,
    verdict: "Choose Seurat if you are comfortable with R and want a polished, all-in-one experience with great visualization. Choose Scanpy if you have massive datasets (>500k cells), need integration with deep learning models, or prefer Python.",
    tools: [
      {
        name: "Seurat",
        fullName: "Seurat R Toolkit",
        logo: "🎨",
        tagline: "R Toolkit for Single Cell Genomics",
        pricing: "Free",
        website: "https://satijalab.org/seurat/",
        developer: "Satija Lab (NYGC)",
        bestFor: "Comprehensive scRNA-seq analysis in R",
        pros: ["Exceptional documentation", "Huge user community", "Powerful integration methods", "Great visualization capabilities", "Supports multimodal data"],
        cons: ["Can be memory intensive", "R dependency (steep curve for some)", "Slower on massive datasets"],
        features: { "Seurat Object": true, "AnnData Support": false, "Integration": true, "Spatial": true, "Python API": false, "R API": true }
      },
      {
        name: "Scanpy",
        fullName: "Single-Cell Analysis in Python",
        logo: "🔬",
        tagline: "Scalable Single-Cell Analysis",
        pricing: "Free",
        website: "https://scanpy.readthedocs.io/",
        developer: "Theis Lab",
        bestFor: "Large-scale single-cell analysis in Python",
        pros: ["Extremely fast and scalable", "Python ecosystem integration (ML/DL)", "Efficient memory usage (AnnData)", "Part of scverse", "Great for trajectory inference"],
        cons: ["Visualization slightly less polished than Seurat", "Documentation can be technical"],
        features: { "Seurat Object": false, "AnnData Support": true, "Integration": true, "Spatial": true, "Python API": true, "R API": false }
      }
    ]
  },
  {
    id: "nextflow-vs-snakemake",
    title: "Nextflow vs Snakemake",
    category: "Workflow Management",
    description: "Compare the two leading workflow managers for reproducible science.",
    detailedDescription: `Reproducibility is the cornerstone of modern bioinformatics, and both Nextflow and Snakemake solve the problem of managing complex pipelines across different computing environments.

Nextflow uses a data-flow programming model. Processes wait for data to arrive on 'channels' before executing. It is built on Groovy and treats containers (Docker/Singularity) as first-class citizens. This makes it exceptionally robust for cloud deployment (AWS Batch, Google LS).

Snakemake is built on Python and uses a file-based rule system similar to GNU Make. You define rules that create output files from input files. It is often easier for beginners to grasp, especially if they know Python, and is very popular for local HPC clusters (Slurm).`,
    verdict: "Choose Nextflow for complex, cloud-native production pipelines or if you need the data-flow parallelism. Choose Snakemake for rapid prototyping, if you are a Python team, or for standard HPC workloads.",
    tools: [
      {
        name: "Nextflow",
        fullName: "Nextflow",
        logo: "🌊",
        tagline: "Data-driven computational pipelines",
        pricing: "Free",
        website: "https://www.nextflow.io/",
        developer: "Seqera Labs",
        bestFor: "Cloud-native & containerized workflows",
        pros: ["Container-native (Docker/Podman)", "Cloud integration (AWS/Google/Azure)", "Data-flow parallelism", "nf-core community pipelines", "Portable"],
        cons: ["Groovy syntax can be tricky", "Steeper learning curve than Snakemake"],
        features: { "Container Support": true, "Cloud Native": true, "Python Based": false, "DSL": true, "HPC Support": true, "Modular": true }
      },
      {
        name: "Snakemake",
        fullName: "Snakemake",
        logo: "🐍",
        tagline: "Python-based workflows",
        pricing: "Free",
        website: "https://snakemake.readthedocs.io/",
        developer: "Johannes Köster",
        bestFor: "Python-based reproducible workflows",
        pros: ["Python syntax (very readable)", "Easy to debug", "Great HPC integration (Slurm/SGE)", "Conda integration", "Widely used"],
        cons: ["Cloud support is less seamless than Nextflow", "File-based logic has some limitations involved with complex branching"],
        features: { "Container Support": true, "Cloud Native": false, "Python Based": true, "DSL": false, "HPC Support": true, "Modular": true }
      }
    ]
  },
  {
    id: "deseq2-vs-edger",
    title: "DESeq2 vs edgeR",
    category: "Differential Expression",
    description: "The classic debate for RNA-seq differential expression analysis.",
    detailedDescription: `Both DESeq2 and edgeR are R packages designed to analyze count data from high-throughput sequencing assays (like RNA-seq) to test for differential expression. They both use the Negative Binomial distribution to model read counts, but differ in their normalization and dispersion estimation methods.

DESeq2 (Differential Expression Analysis for Sequence Count Data) is known for its robust handling of outliers and its 'shrinkage' estimators for dispersion and fold changes. This often results in more conservative, reliable lists of DE genes, especially for experiments with few replicates.

edgeR (Empirical Analysis of Digital Gene Expression in R) uses the Trimmed Mean of M-values (TMM) normalization method and was one of the first tools in this space. It is extremely flexible and powerful for complex experimental designs (GLM functionality).`,
    verdict: "Choose DESeq2 as a robust default for most standard RNA-seq experiments, especially with small sample sizes (n<5). Choose edgeR if you have a very complex experimental design or prefer TMM normalization.",
    tools: [
      {
        name: "DESeq2",
        fullName: "DESeq2",
        logo: "📈",
        tagline: "Differential gene expression analysis",
        pricing: "Free",
        website: "https://bioconductor.org/packages/release/bioc/html/DESeq2.html",
        developer: "Mike Love et al.",
        bestFor: "Standard RNA-seq DE analysis",
        pros: ["Robust outlier handling", "LFC shrinkage useful for visualization", "Excellent documentation/vignette", "Widely cited standard"],
        cons: ["Can be slow on very large matrices", "More conservative (fewer hits)"],
        features: { "Normalization": true, "Visualization": true, "Time-Series": true, "R Package": true, "Python API": false, "GUI": false }
      },
      {
        name: "edgeR",
        fullName: "edgeR",
        logo: "🔪",
        tagline: "Empirical Analysis of DGE",
        pricing: "Free",
        website: "https://bioconductor.org/packages/release/bioc/html/edgeR.html",
        developer: "Mark Robinson et al.",
        bestFor: "Complex experimental designs",
        pros: ["Flexible GLM framework", "TMM normalization", "Fast execution", "Handles complex designs well"],
        cons: ["Less robust to outliers than DESeq2", "Detailed understanding of GLMs required for complex use"],
        features: { "Normalization": true, "Visualization": true, "Time-Series": true, "R Package": true, "Python API": false, "GUI": false }
      }
    ]
  }
  // Add more detailed comparisons as needed - for now we'll generate from basic data
];

// Basic comparison data for other pages
const basicComparisons: Record<string, { title: string; category: string; description: string; tools: { name: string; logo: string }[] }> = {
  "bowtie-vs-star": { title: "Bowtie2 vs STAR", category: "RNA-Seq Alignment", description: "Compare two leading aligners for RNA-seq data", tools: [{ name: "Bowtie2", logo: "🎯" }, { name: "STAR", logo: "⭐" }] },
  "galaxy-vs-clc": { title: "Galaxy vs CLC Genomics Workbench", category: "Analysis Platforms", description: "Open-source vs commercial platforms", tools: [{ name: "Galaxy", logo: "🌌" }, { name: "CLC Genomics", logo: "🔷" }] },
  "geneious-vs-snapgene": { title: "Geneious Prime vs SnapGene", category: "Molecular Biology", description: "Compare molecular biology software", tools: [{ name: "Geneious Prime", logo: "🧪" }, { name: "SnapGene", logo: "📋" }] },
  "samtools-vs-picard": { title: "SAMtools vs Picard", category: "BAM/SAM Processing", description: "Compare BAM processing tools", tools: [{ name: "SAMtools", logo: "🔧" }, { name: "Picard", logo: "🃏" }] },
  "gatk-vs-deepvariant": { title: "GATK vs DeepVariant", category: "Variant Calling", description: "Traditional vs AI-powered variant calling", tools: [{ name: "GATK", logo: "🔬" }, { name: "DeepVariant", logo: "🤖" }] },
  "bioconductor-vs-biopython": { title: "Bioconductor vs Biopython", category: "Programming Libraries", description: "R vs Python ecosystems", tools: [{ name: "Bioconductor", logo: "📊" }, { name: "Biopython", logo: "🐍" }] },
  "illumina-vs-oxford-nanopore": { title: "Illumina vs Oxford Nanopore", category: "Sequencing Platforms", description: "Short-read vs long-read sequencing", tools: [{ name: "Illumina", logo: "💎" }, { name: "Oxford Nanopore", logo: "🧲" }] },
  "ensembl-vs-ucsc": { title: "Ensembl vs UCSC Genome Browser", category: "Genome Browsers", description: "Compare genome browsers", tools: [{ name: "Ensembl", logo: "🔍" }, { name: "UCSC", logo: "🌐" }] },
  "clustal-vs-mafft": { title: "Clustal Omega vs MAFFT", category: "Multiple Sequence Alignment", description: "Compare MSA tools", tools: [{ name: "Clustal Omega", logo: "🔗" }, { name: "MAFFT", logo: "⚡" }] },
  "alphafold-vs-rosetta": { title: "AlphaFold vs Rosetta", category: "Protein Structure", description: "AI vs traditional structure prediction", tools: [{ name: "AlphaFold", logo: "🏆" }, { name: "Rosetta", logo: "🏛️" }] },
  "megahit-vs-spades": { title: "MEGAHIT vs SPAdes", category: "Genome Assembly", description: "Compare assembly tools", tools: [{ name: "MEGAHIT", logo: "🏗️" }, { name: "SPAdes", logo: "♠️" }] },
  "salmon-vs-kallisto": { title: "Salmon vs Kallisto", category: "RNA-Seq Quantification", description: "Compare transcript quantification", tools: [{ name: "Salmon", logo: "🐟" }, { name: "Kallisto", logo: "🎯" }] },
  "deseq2-vs-edger": { title: "DESeq2 vs edgeR", category: "Differential Expression", description: "Compare DE analysis tools", tools: [{ name: "DESeq2", logo: "📈" }, { name: "edgeR", logo: "🔪" }] },
  "fastqc-vs-multiqc": { title: "FastQC vs MultiQC", category: "Quality Control", description: "Compare QC tools", tools: [{ name: "FastQC", logo: "✅" }, { name: "MultiQC", logo: "📊" }] },
  "qiime2-vs-mothur": { title: "QIIME 2 vs mothur", category: "Microbiome Analysis", description: "Compare microbiome platforms", tools: [{ name: "QIIME 2", logo: "🦠" }, { name: "mothur", logo: "🔬" }] },
  "kraken2-vs-metaphlan": { title: "Kraken2 vs MetaPhlAn", category: "Taxonomic Classification", description: "Compare metagenomic classifiers", tools: [{ name: "Kraken2", logo: "🐙" }, { name: "MetaPhlAn", logo: "🧫" }] },
  "cytoscape-vs-gephi": { title: "Cytoscape vs Gephi", category: "Network Analysis", description: "Compare network analysis tools", tools: [{ name: "Cytoscape", logo: "🕸️" }, { name: "Gephi", logo: "📡" }] },
  "nextflow-vs-snakemake": { title: "Nextflow vs Snakemake", category: "Workflow Management", description: "Compare workflow managers", tools: [{ name: "Nextflow", logo: "🌊" }, { name: "Snakemake", logo: "🐍" }] },
  "igv-vs-jbrowse": { title: "IGV vs JBrowse2", category: "Genome Visualization", description: "Compare genome viewers", tools: [{ name: "IGV", logo: "👁️" }, { name: "JBrowse2", logo: "🌐" }] },
  "trimmomatic-vs-fastp": { title: "Trimmomatic vs fastp", category: "Read Preprocessing", description: "Compare trimming tools", tools: [{ name: "Trimmomatic", logo: "✂️" }, { name: "fastp", logo: "🚀" }] },
  "interpro-vs-pfam": { title: "InterPro vs Pfam", category: "Protein Annotation", description: "Compare annotation databases", tools: [{ name: "InterPro", logo: "🔎" }, { name: "Pfam", logo: "📚" }] },
  "kegg-vs-reactome": { title: "KEGG vs Reactome", category: "Pathway Databases", description: "Compare pathway databases", tools: [{ name: "KEGG", logo: "🗺️" }, { name: "Reactome", logo: "⚛️" }] },
  "seurat-vs-scanpy": { title: "Seurat vs Scanpy", category: "Single-Cell Analysis", description: "Compare scRNA-seq tools", tools: [{ name: "Seurat", logo: "🎨" }, { name: "Scanpy", logo: "🔬" }] },
  "prokka-vs-bakta": { title: "Prokka vs Bakta", category: "Genome Annotation", description: "Compare prokaryotic annotators", tools: [{ name: "Prokka", logo: "🦠" }, { name: "Bakta", logo: "🔬" }] },
  // NEW 25 COMPARISONS
  "autodock-vs-vina": { title: "AutoDock vs AutoDock Vina", category: "Molecular Docking", description: "Compare classic docking with its faster successor", tools: [{ name: "AutoDock 4", logo: "🔮" }, { name: "AutoDock Vina", logo: "⚡" }] },
  "glide-vs-gold": { title: "Glide vs GOLD", category: "Molecular Docking", description: "Commercial molecular docking comparison", tools: [{ name: "Schrödinger Glide", logo: "💫" }, { name: "GOLD", logo: "🏅" }] },
  "bismark-vs-bsmap": { title: "Bismark vs BSMAP", category: "Methylation Analysis", description: "Compare bisulfite sequencing aligners", tools: [{ name: "Bismark", logo: "🧬" }, { name: "BSMAP", logo: "🗺️" }] },
  "macs2-vs-homer": { title: "MACS2 vs HOMER", category: "ChIP-Seq Analysis", description: "Compare peak callers for ChIP-seq", tools: [{ name: "MACS2", logo: "📍" }, { name: "HOMER", logo: "📖" }] },
  "maxquant-vs-proteome-discoverer": { title: "MaxQuant vs Proteome Discoverer", category: "Proteomics", description: "Compare mass spectrometry platforms", tools: [{ name: "MaxQuant", logo: "📊" }, { name: "Proteome Discoverer", logo: "🔷" }] },
  "skyline-vs-diann": { title: "Skyline vs DIA-NN", category: "Proteomics", description: "Compare targeted proteomics tools", tools: [{ name: "Skyline", logo: "📈" }, { name: "DIA-NN", logo: "🤖" }] },
  "benchling-vs-crispor": { title: "Benchling vs CRISPOR", category: "CRISPR Design", description: "Commercial vs free CRISPR design", tools: [{ name: "Benchling", logo: "🧬" }, { name: "CRISPOR", logo: "✂️" }] },
  "chopchop-vs-crisprscan": { title: "CHOPCHOP vs CRISPRscan", category: "CRISPR Design", description: "Compare gRNA design tools", tools: [{ name: "CHOPCHOP", logo: "🔪" }, { name: "CRISPRscan", logo: "🎯" }] },
  "champ-vs-minfi": { title: "ChAMP vs minfi", category: "Methylation Arrays", description: "Compare Illumina array tools", tools: [{ name: "ChAMP", logo: "🏆" }, { name: "minfi", logo: "📉" }] },
  "diffbind-vs-deseq2-chipseq": { title: "DiffBind vs DESeq2 (ChIP-seq)", category: "ChIP-Seq Analysis", description: "Compare differential binding tools", tools: [{ name: "DiffBind", logo: "🔗" }, { name: "DESeq2 (ChIP)", logo: "📊" }] },
  "cellranger-vs-starsolo": { title: "Cell Ranger vs STARsolo", category: "Single-Cell Preprocessing", description: "10x official vs open-source", tools: [{ name: "Cell Ranger", logo: "🔟" }, { name: "STARsolo", logo: "⭐" }] },
  "cellphonedb-vs-nichenet": { title: "CellPhoneDB vs NicheNet", category: "Cell Communication", description: "Compare cell-cell interaction tools", tools: [{ name: "CellPhoneDB", logo: "📱" }, { name: "NicheNet", logo: "🌐" }] },
  "monocle-vs-slingshot": { title: "Monocle3 vs Slingshot", category: "Trajectory Analysis", description: "Compare pseudotime tools", tools: [{ name: "Monocle3", logo: "🔭" }, { name: "Slingshot", logo: "🎿" }] },
  "harmony-vs-scvi": { title: "Harmony vs scVI", category: "Data Integration", description: "Compare batch correction methods", tools: [{ name: "Harmony", logo: "🎵" }, { name: "scVI", logo: "🧠" }] },
  "humann-vs-humann3": { title: "HUMAnN2 vs HUMAnN3", category: "Metagenomic Profiling", description: "Compare HUMAnN versions", tools: [{ name: "HUMAnN2", logo: "🧬" }, { name: "HUMAnN3", logo: "🚀" }] },
  "picrust2-vs-tax4fun": { title: "PICRUSt2 vs Tax4Fun", category: "Functional Prediction", description: "Compare 16S function prediction", tools: [{ name: "PICRUSt2", logo: "🔮" }, { name: "Tax4Fun", logo: "📊" }] },
  "flye-vs-canu": { title: "Flye vs Canu", category: "Long-Read Assembly", description: "Compare long-read assemblers", tools: [{ name: "Flye", logo: "✈️" }, { name: "Canu", logo: "🔩" }] },
  "minimap2-vs-ngmlr": { title: "Minimap2 vs NGMLR", category: "Long-Read Alignment", description: "Compare long-read aligners", tools: [{ name: "Minimap2", logo: "🗺️" }, { name: "NGMLR", logo: "🔬" }] },
  "sniffles-vs-cutesv": { title: "Sniffles vs CuteSV", category: "Structural Variants", description: "Compare SV callers", tools: [{ name: "Sniffles", logo: "👃" }, { name: "CuteSV", logo: "💘" }] },
  "anvio-vs-metawrap": { title: "anvi'o vs MetaWRAP", category: "Metagenome Binning", description: "Compare binning platforms", tools: [{ name: "anvi'o", logo: "🔥" }, { name: "MetaWRAP", logo: "🎁" }] },
  "gtdbtk-vs-checkm": { title: "GTDB-Tk vs CheckM", category: "MAG Quality", description: "Compare MAG tools", tools: [{ name: "GTDB-Tk", logo: "🌳" }, { name: "CheckM", logo: "✅" }] },
  "roary-vs-panaroo": { title: "Roary vs Panaroo", category: "Pan-Genomics", description: "Compare pan-genome tools", tools: [{ name: "Roary", logo: "🍖" }, { name: "Panaroo", logo: "🦜" }] },
  "snippy-vs-cfsan": { title: "Snippy vs CFSAN SNP Pipeline", category: "Bacterial SNP Calling", description: "Compare bacterial SNP pipelines", tools: [{ name: "Snippy", logo: "✂️" }, { name: "CFSAN SNP", logo: "🏛️" }] },
  "iqtree-vs-raxml": { title: "IQ-TREE vs RAxML-NG", category: "Phylogenetics", description: "Compare ML phylogenetic tools", tools: [{ name: "IQ-TREE", logo: "🌲" }, { name: "RAxML-NG", logo: "🌴" }] },
};

function FeatureIcon({ value }: { value: boolean }) {
  if (value === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const comparison = comparisons.find(c => c.id === id) || basicComparisons[id];
  
  if (!comparison) {
    return { title: "Comparison Not Found" };
  }
  
  return {
    title: `${comparison.title} | BioinformaticsHub.io`,
    description: comparison.description,
  };
}

export default async function ComparisonDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Check for detailed comparison first
  const detailedComparison = comparisons.find(c => c.id === id);
  
  if (detailedComparison) {
    return <DetailedComparisonView comparison={detailedComparison} />;
  }
  
  // Check for basic comparison
  const basicComparison = basicComparisons[id];
  
  if (basicComparison) {
    return <BasicComparisonView comparison={basicComparison} id={id} />;
  }
  
  notFound();
}

function DetailedComparisonView({ comparison }: { comparison: typeof comparisons[0] }) {
  const tool1 = comparison.tools[0];
  const tool2 = comparison.tools[1];
  const allFeatures = Object.keys(tool1.features);
  
  return (
    <div className="min-h-screen">
      <PageHeader
        title={comparison.title}
        subtitle={comparison.description}
        backgroundImage="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920"
      />
      
      <section className="container mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Comparisons
        </Link>
        
        {/* Category badge */}
        <div className="mb-8">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {comparison.category}
          </span>
        </div>
        
        {/* Tool cards side by side */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[tool1, tool2].map((tool, idx) => (
            <div key={idx} className="glass-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{tool.logo}</span>
                <div>
                  <h2 className="text-2xl font-bold">{tool.name}</h2>
                  <p className="text-sm text-muted-foreground">{tool.fullName}</p>
                  <p className="text-sm text-primary mt-1">{tool.tagline}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className={`font-medium ${tool.pricing === 'Free' ? 'text-green-500' : 'text-orange-500'}`}>
                    {tool.pricing}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{tool.developer}</span>
                </div>
                
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Best For</span>
                </div>
                <p className="text-lg font-medium">{tool.bestFor}</p>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-green-500 uppercase tracking-wide mb-3">Pros</h4>
                <ul className="space-y-2">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-red-500 uppercase tracking-wide mb-3">Cons</h4>
                <ul className="space-y-2">
                  {tool.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {/* Feature comparison table */}
        <div className="glass-card p-6 mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Feature Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-medium">{tool1.name}</th>
                  <th className="text-center py-4 px-4 text-sm font-medium">{tool2.name}</th>
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-4 px-4">{feature}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <FeatureIcon value={tool1.features[feature as keyof typeof tool1.features]} />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <FeatureIcon value={tool2.features[feature as keyof typeof tool2.features]} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Detailed analysis */}
        <div className="glass-card p-6 mb-12">
          <h3 className="text-xl font-bold mb-4">Detailed Analysis</h3>
          <div className="prose prose-invert max-w-none">
            {comparison.detailedDescription.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-muted-foreground mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
        
        {/* Verdict */}
        <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Our Verdict
          </h3>
          <p className="text-lg">{comparison.verdict}</p>
        </div>
        
        {/* Related comparisons */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Related Comparisons</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(basicComparisons).slice(0, 3).map(([key, comp]) => (
              <Link
                key={key}
                href={`/compare/${key}`}
                className="glass-card p-4 hover:border-primary/50 transition-all"
              >
                <span className="text-xs text-primary">{comp.category}</span>
                <h4 className="font-bold mt-1">{comp.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BasicComparisonView({ comparison, id }: { comparison: typeof basicComparisons[string]; id: string }) {
  return (
    <div className="min-h-screen">
      <PageHeader
        title={comparison.title}
        subtitle={comparison.description}
        backgroundImage="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920"
      />
      
      <section className="container mx-auto px-4 py-12">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Comparisons
        </Link>
        
        <div className="mb-8">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {comparison.category}
          </span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="glass-card p-8 text-center mb-8">
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <span className="text-6xl block mb-2">{comparison.tools[0].logo}</span>
                  <span className="text-xl font-bold">{comparison.tools[0].name}</span>
                </div>
                <span className="text-2xl text-muted-foreground">vs</span>
                <div className="text-center">
                  <span className="text-6xl block mb-2">{comparison.tools[1].logo}</span>
                  <span className="text-xl font-bold">{comparison.tools[1].name}</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{comparison.title}</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{comparison.description}</p>
              
              <div className="glass p-6 rounded-xl max-w-2xl mx-auto bg-primary/5 border-primary/10">
                <p className="text-foreground font-medium mb-2">
                  Detailed Head-to-Head Comparison In Progress
                </p>
                <p className="text-sm text-muted-foreground">
                  Our editors are currently testing {comparison.tools[0].name} and {comparison.tools[1].name} 
                  to provide an unbiased verdict. Check back soon for benchmarking results.
                </p>
              </div>
            </div>

            {/* General Advice Section */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">How to Choose Between Bioinformatics Tools</h3>
              <div className="prose prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground">
                  When selecting between tools like {comparison.tools[0].name} and {comparison.tools[1].name}, 
                  several key factors should influence your decision beyond just raw performance metrics.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-primary" /> Documentation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Does the tool have a comprehensive manual? Good documentation is often more valuable 
                      than a slight speed advantage, especially for complex pipelines.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Community Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Check Biostars and GitHub issues. A tool with an active community means 
                      you&apos;ll find help faster when you encounter errors.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" /> Citation Count
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Widely cited tools are often the &quot;standard&quot; for publication. 
                      Reviewers are more likely to accept results from established software.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> Resource Usage
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Consider your infrastructure. Do you have access to an HPC cluster, 
                      or do you need a tool that can run on a local laptop?
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 mt-6">
                  <h4 className="font-semibold text-foreground mb-4">General Best Practices</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                    <li>
                      <strong>Benchmark on your own data:</strong> Public benchmarks might not reflect your specific organism or sequencing depth.
                    </li>
                    <li>
                      <strong>Check for maintenance:</strong> When was the last commit? Abandoned tools often have unpatched bugs.
                    </li>
                    <li>
                      <strong>Consider the workflow:</strong> Does the tool integrate easily with your existing upstream and downstream software (e.g., compatible file formats)?
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="glass-card p-6 mb-6 sticky top-24">
              <h3 className="font-bold mb-4">Related Categories</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {[comparison.category, "Bioinformatics", "Genomics"].map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h3 className="font-bold mb-4">Explore Directory</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find full details, versions, and installation guides in our tools directory.
              </p>
              <Link
                href="/directory"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                Go to Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
