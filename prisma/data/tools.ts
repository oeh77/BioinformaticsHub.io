
export const tools = [
  {
    name: "BLAST",
    slug: "blast",
    description: "The Basic Local Alignment Search Tool (BLAST) finds regions of local similarity between sequences. The program compares nucleotide or protein sequences to sequence databases and calculates the statistical significance of matches.",
    url: "https://blast.ncbi.nlm.nih.gov/Blast.cgi",
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
    url: "https://gatk.broadinstitute.org/",
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
    url: "https://satijalab.org/seurat/",
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
    url: "https://www.nextflow.io/",
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
    url: "https://multiqc.info/",
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
  },
  {
    name: "AlphaFold",
    slug: "alphafold",
    description: "An AI system developed by Google DeepMind that predicts a protein's 3D structure from its amino acid sequence with atomic accuracy.",
    url: "https://deepmind.google/technologies/alphafold/",
    content: `
      <h2>Overview</h2>
      <p>AlphaFold has revolutionized biology by solving the 50-year-old protein folding problem. It uses a novel deep learning architecture to predict the 3D structure of nearly all known proteins with high accuracy.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Atomic Accuracy:</strong> Predicts structures comparable to experimental methods like X-ray crystallography.</li>
        <li><strong>AlphaFold Database:</strong> Provides open access to over 200 million protein structure predictions.</li>
        <li><strong>Multimer Prediction:</strong> Capable of modeling protein-protein complexes and interactions.</li>
      </ul>
      
      <h2>Impact</h2>
      <p>It accelerates drug discovery, helps understand disease mechanisms, and advances synthetic biology by providing structural insights previously unavailable.</p>
    `,
    category: "AI in Biology",
    pricing: "Free",
    featured: true
  },
  {
    name: "RoseTTAFold",
    slug: "rosettafold",
    description: "A deep learning tool from the Baker Lab that predicts protein structures and interactions, capable of modeling multi-protein complexes.",
    url: "https://robetta.bakerlab.org/",
    content: `
      <h2>Overview</h2>
      <p>Developed by the Baker Lab at the University of Washington, RoseTTAFold is a powerful deep learning software for protein structure prediction, often seen as a complementary tool to AlphaFold.</p>
      
      <h2>Capabilities</h2>
      <ul>
        <li><strong>Complex Modeling:</strong> Excellent at predicting multi-subunit protein complexes.</li>
        <li><strong>Speed:</strong> Designed to be computationally efficient.</li>
        <li><strong>Three-Track Network:</strong> Simultaneously processes sequence, distance, and coordinate information for high accuracy.</li>
      </ul>
    `,
    category: "AI in Biology",
    pricing: "Free",
    featured: true
  },
  {
    name: "DeepVariant",
    slug: "deepvariant",
    description: "A deep learning genomic variant caller developed by Google that uses a convolutional neural network to call genetic variants from next-generation sequencing data.",
    url: "https://github.com/google/deepvariant",
    content: `
      <h2>Overview</h2>
      <p>DeepVariant applies computer vision techniques to genomics. It treats read alignments as images and uses a Convolutional Neural Network (CNN) to classify whether a position is a variant or noise.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li><strong>High Accuracy:</strong> Outperforms many traditional statistical variant callers, especially for indels.</li>
        <li><strong>Model Training:</strong> Can be retrained or fine-tuned on custom data (e.g., non-human species).</li>
        <li><strong>Integration:</strong> Widely adopted in modern pipelines and available on cloud platforms (GCP, AWS).</li>
      </ul>
    `,
    category: "AI in Biology",
    pricing: "Free",
    featured: true
  },
  {
    name: "CellProfiler",
    slug: "cellprofiler",
    description: "Open-source software for quantitative analysis of biological images, utilizing machine learning for identifying and measuring cells.",
    url: "https://cellprofiler.org/",
    content: `
      <h2>Overview</h2>
      <p>CellProfiler allows biologists to quantitatively measure phenotypes from thousands of images automatically. It includes advanced machine learning modules (CellProfiler Analyst) to classify complex cellular morphologies.</p>
      
      <h2>Features</h2>
      <ul>
        <li><strong>Modular Pipelines:</strong> Users build analysis workflows by combining image processing modules.</li>
        <li><strong>Machine Learning:</strong> Train classifiers to recognize specific cell states or phenotypes.</li>
        <li><strong>High-Throughput:</strong> Designed to handle large datasets from microscopy screens.</li>
      </ul>
    `,
    category: "AI in Biology",
    pricing: "Free",
    featured: true
  },
  {
    name: "Elicit",
    slug: "elicit",
    description: "An AI research assistant that automates literature reviews, extracting key findings from papers and helping researchers synthesis evidence.",
    url: "https://elicit.com/",
    content: `
      <h2>Overview</h2>
      <p>Elicit uses Large Language Models (LLMs) to help researchers navigate scientific literature. It can find relevant papers without perfect keyword matches and extract specific data points from them automatically.</p>
      
      <h2>Workflow</h2>
      <ul>
        <li><strong>Literature Review:</strong> Ask a question, and Elicit finds papers and summarizes their abstract/findings in a table.</li>
        <li><strong>Data Extraction:</strong> Define columns (e.g., "Sample size", "Dosage") and Elicit extracts this info from PDFs.</li>
        <li><strong>Synthesis:</strong> Generates summaries of the top papers to answer your research question.</li>
      </ul>
    `,
    category: "AI in Biology",
    pricing: "Freemium",
    featured: true
  },
  {
    name: "BioGPT",
    slug: "biogpt",
    description: "A domain-specific generative Transformer language model pre-trained on large-scale biomedical literature for biomedical text mining tasks.",
    url: "https://github.com/microsoft/BioGPT",
    content: `
      <h2>Overview</h2>
      <p>Developed by Microsoft, BioGPT is a generative pre-trained Transformer language model specifically trained on massive amounts of biomedical literature. It excels at tasks like relation extraction, question answering, and text verification in the bio-domain.</p>
      
      <h2>Performance</h2>
      <p>It has demonstrated human-parity performance on certain biomedical text generation tasks and outperforms general-purpose models on domain-specific benchmarks.</p>
    `,
    category: "AI in Biology",
    pricing: "Free",
    featured: true
  }
];
