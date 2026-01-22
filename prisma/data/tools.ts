export const tools = [
  {
    name: "BLAST",
    slug: "blast",
    description: "The Basic Local Alignment Search Tool (BLAST) finds regions of local similarity between sequences. The program compares nucleotide or protein sequences to sequence databases and calculates the statistical significance of matches.",
    content: `
      <h2>Overview</h2>
      <p>BLAST (Basic Local Alignment Search Tool) is perhaps the most widely used bioinformatics program in the world. Developed by NCBI, it allows researchers to compare a query sequence with a library or database of sequences, identifying library sequences that resemble the query sequence above a certain threshold.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Heuristic Algorithm:</strong> Uses a faster approach than Smith-Waterman to find optimal local alignments.</li>
        <li><strong>Versatility:</strong> Variants like BLASTN, BLASTP, BLASTX, TBLASTN, and TBLASTX handle different combinations of nucleotide and protein queries/databases.</li>
        <li><strong>Statistical Significance:</strong> Provides E-values (Expect values) to help users judge the biological significance of matches.</li>
      </ul>

      <h2>Use Cases</h2>
      <p>BLAST is essential for species identification, domain location, establishing phylogeny, DNA mapping, and comparison. It serves as the first step in almost any sequence analysis workflow.</p>
    `,
    category: "RNA-seq Analysis", 
    pricing: "Free",
    featured: true
  },
  {
    name: "GATK",
    slug: "gatk",
    description: "The Genome Analysis Toolkit (GATK) is the industry standard for variant discovery in high-throughput sequencing data. Developed by the Broad Institute.",
    content: `
      <h2>Overview</h2>
      <p>The Genome Analysis Toolkit (GATK) is a software package for analysis of high-throughput sequencing data, developed by the Data Science Platform group at the Broad Institute. The toolkit offers a wide variety of tools, with a primary focus on variant discovery and genotyping as well as data quality assurance.</p>
      
      <h2>Best Practices</h2>
      <p>GATK is famous for its "Best Practices" workflows—step-by-step recommendations for performing variant discovery in germline and somatic contexts, as well as RNA-seq variant calling.</p>
      
      <h2>Core Tools</h2>
      <ul>
        <li><strong>HaplotypeCaller:</strong> The standard tool for calling germline SNPs and indels via local de-novo assembly of haplotypes.</li>
        <li><strong>Mutect2:</strong> Designed for somatic mutation calling (tumor vs normal).</li>
        <li><strong>VQSR:</strong> Variant Quality Score Recalibration for filtering raw variant calls.</li>
      </ul>
    `,
    category: "Variant Calling",
    pricing: "Free",
    featured: true
  },
  {
    name: "Seurat",
    slug: "seurat",
    description: "An R toolkit for single-cell genomics. It is designed for QC, analysis, and exploration of single-cell RNA-seq data.",
    content: `
      <h2>Overview</h2>
      <p>Seurat is an R package designed for QC, analysis, and exploration of single-cell RNA-seq data. Seurat aims to enable users to identify and interpret sources of heterogeneity from single-cell transcriptomic measurements, and to integrate diverse types of single-cell data.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Preprocessing:</strong> QC metrics, normalization, and scaling.</li>
        <li><strong>Dimensionality Reduction:</strong> PCA, t-SNE, and UMAP implementation.</li>
        <li><strong>Clustering:</strong> Graph-based clustering to identify cell types.</li>
        <li><strong>Integration:</strong> Powerful methods to integrate datasets across conditions, technologies, or species (the "anchor" method).</li>
      </ul>

      <h2>Why Seurat?</h2>
      <p>It has massive community support, comprehensive tutorials, and is frequently updated to support new modalities like spatial transcriptomics (Seurat v5).</p>
    `,
    category: "Single-cell Analysis",
    pricing: "Free",
    featured: true
  },
  {
    name: "Nextflow",
    slug: "nextflow",
    description: "A workflow system for creating scalable, portable, and reproducible scientific workflows using software containers.",
    content: `
      <h2>Overview</h2>
      <p>Nextflow enables scalable and reproducible scientific workflows using software containers. It allows the adaptation of pipelines written in the most common scripting languages.</p>
      
      <h2>Reactive Workflow Model</h2>
      <p>Nextflow uses a data-flow programming model. Processes are connected via channels; as soon as a process receives an input, it executes. This allows for massive automatic parallelism.</p>
      
      <h2>Portability</h2>
      <p>Separate the logic of the workflow from the configuration of the execution platform. A pipeline written on a laptop can run on a university cluster or AWS Batch with a simple configuration file change.</p>
    `,
    category: "Workflow Managers",
    pricing: "Free",
    featured: true
  },
  {
    name: "MultiQC",
    slug: "multiqc",
    description: "Aggregate results from bioinformatics analyses across many samples into a single report.",
    content: `
      <h2>Overview</h2>
      <p>MultiQC searches a given directory for analysis logs and compiles a HTML report. It's a general use tool, perfect for summarizing the output from numerous bioinformatics tools.</p>
      
      <h2>Supported Tools</h2>
      <p>It supports 100+ bioinformatics tools including FastQC, STAR, Kallisto, Salmon, GATK, Picard, and many more.</p>
      
      <h2>Interactive Plots</h2>
      <p>The reports generated are interactive, allowing you to highlight specific samples, rename them, or hide outliers. It is indispensable for the Quality Control step of any pipeline.</p>
    `,
    category: "Visualization",
    pricing: "Free",
    featured: true
  }
];
