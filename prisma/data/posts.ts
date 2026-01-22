export const posts = [
  {
    title: "Introduction to NGS Data Analysis",
    slug: "introduction-to-ngs-data-analysis",
    excerpt: "A comprehensive guide to understanding the Next-Generation Sequencing workflow, from raw reads to biological insights.",
    content: `
      <h2>The Revolution of NGS</h2>
      <p>Next-Generation Sequencing (NGS) has transformed biology. Unlike Sanger sequencing, which processes one DNA fragment at a time, NGS processes millions of fragments in parallel. This massive throughput has dropped the cost of sequencing a human genome from $100M to under $200.</p>
      
      <h2>The Standard Workflow</h2>
      <ol>
        <li><strong>Quality Control (QC):</strong> Raw data (FASTQ) must be checked for quality issues using tools like <em>FastQC</em>.</li>
        <li><strong>Trimming:</strong> Removing adapters and low-quality bases with <em>Trimmomatic</em> or <em>fastp</em>.</li>
        <li><strong>Alignment:</strong> Mapping reads to a reference genome. For DNA, we use <em>BWA</em> or <em>Bowtie2</em>. For RNA, splice-aware aligners like <em>STAR</em> are required.</li>
        <li><strong>Variant Calling / Quantification:</strong> Depending on the goal, we identify mutations (GATK) or count gene expression (featureCounts).</li>
      </ol>
      
      <h2>Challenges</h2>
      <p>Data storage and computational power are major bottlenecks. A single human genome can be 100GB. Efficient algorithms and cloud computing are becoming essential skills for bioinformaticians.</p>
    `,
    category: "Beginner Guides",
    published: true
  },
  {
    title: "Getting Started with Single-Cell RNA-Seq",
    slug: "getting-started-single-cell-rna-seq",
    excerpt: "Unlock the heterogeneity of tissues by analyzing gene expression at the resolution of individual cells.",
    content: `
      <h2>Why Single-Cell?</h2>
      <p>Bulk RNA-seq averages expression across thousands of cells, hiding rare populations. Single-cell RNA-seq (scRNA-seq) measures expression in each cell independently, allowing us to discover new cell types and track developmental trajectories.</p>
      
      <h2>The 10x Genomics Workflow</h2>
      <p>The most common platform, 10x Genomics, uses microfluidics to encapsulate cells in oil droplets with unique barcodes. This allows we to trace every read back to its cell of origin.</p>
      
      <h2>Analysis Steps with Seurat</h2>
      <ul>
        <li><strong>QC:</strong> Filter distinct cells (doublets) and dead cells (high mitochondrial content).</li>
        <li><strong>Normalization:</strong> Adjust for sequencing depth differences.</li>
        <li><strong>HVG Selection:</strong> Focus on Highly Variable Genes that drive biological difference.</li>
        <li><strong>Clustering:</strong> Group cells by spectral similarity.</li>
        <li><strong>Annotation:</strong> Use known markers to label clusters (e.g., CD3+ = T-Cells).</li>
      </ul>
    `,
    category: "Single-cell Analysis",
    published: true
  },
  {
    title: "Python vs R for Bioinformatics: Which One?",
    slug: "python-vs-r-bioinformatics",
    excerpt: "The eternal debate. We break down the strengths and weaknesses of both languages to help you decide.",
    content: `
      <h2>The Short Answer</h2>
      <p>Learn both. But if you must choose one to start:</p>
      <ul>
        <li><strong>Choose R</strong> if you are focused on <strong>statistics</strong>, RNA-seq analysis (DESeq2, edgeR), or visualization (ggplot2). It is the language of Bioconductor.</li>
        <li><strong>Choose Python</strong> if you are interested in <strong>machine learning</strong>, deep learning, building scalable pipelines, or general-purpose scripting. It is the language of Biopython, Snakemake, and scverse.</li>
      </ul>
      
      <h2>Visualization</h2>
      <p>R's <em>ggplot2</em> is widely considered the gold standard for publication-quality static figures. Python's <em>matplotlib</em> and <em>seaborn</em> are powerful, but R often produces prettier plots out of the box.</p>
      
      <h2>Machine Learning</h2>
      <p>Python wins hands down. Libraries like <em>scikit-learn</em>, <em>PyTorch</em>, and <em>TensorFlow</em> make Python the undisputed king of AI in biology.</p>
    `,
    category: "Careers",
    published: true
  },
  {
    title: "Understanding Variant Calling: VCF Format Explained",
    slug: "understanding-vcf-format",
    excerpt: "The Variant Call Format (VCF) is the currency of genomic variation. Learn how to decode this complex file standard.",
    content: `
      <h2>What is VCF?</h2>
      <p>The Variant Call Format (VCF) is a text file format (likely compressed as .vcf.gz) used to store gene sequence variations. It contains a header (metadata) and data lines (variants).</p>
      
      <h2>Key Columns</h2>
      <ul>
        <li><strong>CHROM/POS:</strong> Location of the variant.</li>
        <li><strong>ID:</strong> Unique identifier (e.g., rsID from dbSNP).</li>
        <li><strong>REF/ALT:</strong> The reference base and the alternative observed base.</li>
        <li><strong>QUAL:</strong> Phred-scaled probability that the variant holds.</li>
        <li><strong>INFO:</strong> A semicolon-separated list of additional information (e.g., DP=Depth, AF=Allele Frequency).</li>
      </ul>
      
      <h2>Common Tools</h2>
      <p>Tools like <em>bcftools</em> and <em>vcftools</em> are used to manipulate VCFs—filtering, merging, and intersecting variant sets.</p>
    `,
    category: "Variant Calling",
    published: true
  },
  {
    title: "Nextflow vs Snakemake: Modern Workflow Management",
    slug: "nextflow-vs-snakemake-guide",
    excerpt: "Reproducibility is key in science. We compare the two leading workflow managers to help you automate your research.",
    content: `
      <h2>The reproducibility Crisis</h2>
      <p>Running scripts manually is prone to error. Workflow managers automate the execution of tasks, handling dependencies and parallelization.</p>
      
      <h2>Nextflow</h2>
      <p>Built on Groovy, Nextflow abstract the computing environment using containers (Docker, Singularity). It shines in cloud environments (AWS, Google Life Sciences) and supports the "Dataflow" paradigm where processes wait for input channel data.</p>
      
      <h2>Snakemake</h2>
      <p>Built on Python, Snakemake uses a file-based rule system. It feels very natural for Python developers and is extremely easy to set up on local clusters (Slurm). If you know Python, Snakemake has a near-zero learning curve.</p>
      
      <h2>Conclusion</h2>
      <p>Both are excellent. Nextflow is gaining slight edge in large consortia and cloud-native production pipelines (nf-core). Snakemake remains a favorite for individual labs and rapid prototyping.</p>
    `,
    category: "Workflow Managers",
    published: true
  }
];
