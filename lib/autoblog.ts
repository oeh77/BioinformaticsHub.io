import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API Keys for media
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Fetch a relevant image from Unsplash
 */
async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log("⚠️ Unsplash API key not configured, using placeholder");
    return null;
  }

  try {
    const searchQuery = encodeURIComponent(`${query} bioinformatics science`);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Pick a random image from results
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
      const image = data.results[randomIndex];
      return image.urls?.regular || image.urls?.small || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching from Unsplash:", error);
    return null;
  }
}

/**
 * Fetch multiple images from Unsplash for the gallery
 */
async function fetchUnsplashImages(query: string, count: number = 4): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return [];
  }

  try {
    const searchQuery = encodeURIComponent(`${query} biology science laboratory`);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=${count + 2}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results
        .slice(0, count)
        .map((img: { urls: { regular?: string; small?: string } }) => img.urls?.regular || img.urls?.small)
        .filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error("Error fetching images from Unsplash:", error);
    return [];
  }
}

/**
 * Fetch a relevant YouTube video
 */
async function fetchYouTubeVideo(query: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.log("⚠️ YouTube API key not configured, using placeholder");
    return null;
  }

  try {
    const searchQuery = encodeURIComponent(`${query} bioinformatics tutorial`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=5&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      // Pick a random video from results
      const randomIndex = Math.floor(Math.random() * Math.min(data.items.length, 5));
      const video = data.items[randomIndex];
      return `https://www.youtube.com/watch?v=${video.id.videoId}`;
    }
    return null;
  } catch (error) {
    console.error("Error fetching from YouTube:", error);
    return null;
  }
}

/**
 * Generate placeholder image URL using a free service
 */
function getPlaceholderImage(topic: string, index: number = 0): string {
  // Use picsum.photos for placeholder images
  const seed = topic.replace(/\s+/g, '-').toLowerCase() + index;
  return `https://picsum.photos/seed/${seed}/1200/630`;
}

/**
 * Generate placeholder video URL (a generic educational video)
 */
function getPlaceholderVideo(): string {
  // Some generic bioinformatics educational videos from YouTube
  const placeholderVideos = [
    "https://www.youtube.com/watch?v=fCd6B5HRaZ8", // Bioinformatics intro
    "https://www.youtube.com/watch?v=As5S-yEoVig", // What is bioinformatics
    "https://www.youtube.com/watch?v=lHflT5v1yF4", // DNA sequencing
    "https://www.youtube.com/watch?v=MvuYATh7Y74", // Python for bioinformatics
    "https://www.youtube.com/watch?v=SjLBQg3T2nM", // NGS data analysis
  ];
  return placeholderVideos[Math.floor(Math.random() * placeholderVideos.length)];
}

// Topics for each category to generate varied content
const categoryTopics: Record<string, string[]> = {
  "python-bioinformatics": [
    "BioPython for sequence analysis",
    "Pandas for genomic data",
    "Scikit-learn for biomarker discovery",
    "NumPy for biological computations",
    "Matplotlib for visualization"
  ],
  "r-biostatistics": [
    "DESeq2 for differential expression",
    "ggplot2 for publication-ready plots",
    "limma for microarray analysis",
    "survival analysis in R",
    "mixed effects models"
  ],
  "ngs-analysis": [
    "FASTQ quality control",
    "read alignment with BWA",
    "SAMtools for BAM processing",
    "peak calling with MACS2",
    "read counting strategies"
  ],
  "protein-structure-prediction": [
    "AlphaFold2 predictions",
    "homology modeling basics",
    "molecular docking",
    "protein-ligand interactions",
    "structure validation"
  ],
  "machine-learning-genomics": [
    "CNN for DNA sequence classification",
    "random forests for variant classification",
    "autoencoders for dimensionality reduction",
    "transfer learning in genomics",
    "feature engineering for omics"
  ],
  "single-cell-analysis-tutorial": [
    "Seurat clustering workflow",
    "trajectory analysis with Monocle",
    "batch correction methods",
    "cell type annotation",
    "differential expression in scRNA-seq"
  ],
  "genome-assembly-tutorial": [
    "de novo assembly with SPAdes",
    "long-read assembly with Flye",
    "hybrid assembly approaches",
    "assembly quality metrics",
    "scaffolding strategies"
  ],
  "variant-calling-tutorial": [
    "GATK best practices",
    "FreeBayes variant calling",
    "structural variant detection",
    "annotation with ANNOVAR",
    "variant filtering strategies"
  ],
  "phylogenetics-tutorial": [
    "multiple sequence alignment",
    "tree building with IQ-TREE",
    "Bayesian phylogenetics",
    "molecular clock analysis",
    "tree visualization with ggtree"
  ],
  "metagenomics-tutorial": [
    "16S rRNA analysis pipeline",
    "shotgun metagenomics workflow",
    "taxonomic classification with Kraken2",
    "functional annotation",
    "diversity analysis"
  ],
  "genomics-news": [
    "latest genome sequencing advances",
    "new reference genome releases",
    "population genomics discoveries",
    "long-read sequencing developments",
    "ancient DNA breakthroughs"
  ],
  "proteomics-insights": [
    "mass spectrometry advances",
    "proteome-wide studies",
    "post-translational modifications",
    "protein biomarkers",
    "proteomics data standards"
  ],
  "transcriptomics": [
    "RNA-seq technology updates",
    "alternative splicing analysis",
    "long non-coding RNAs",
    "spatial transcriptomics",
    "RNA modifications"
  ],
  "metabolomics": [
    "metabolite identification",
    "pathway analysis tools",
    "lipidomics advances",
    "metabolic modeling",
    "multi-omics integration"
  ],
  "structural-biology": [
    "cryo-EM advances",
    "X-ray crystallography",
    "NMR spectroscopy",
    "molecular dynamics simulations",
    "structure databases"
  ],
  "drug-discovery": [
    "virtual screening methods",
    "ADMET prediction",
    "lead optimization",
    "drug repurposing",
    "target identification"
  ],
  "clinical-bioinformatics": [
    "clinical genomics workflows",
    "pharmacogenomics",
    "cancer genomics",
    "diagnostic variant interpretation",
    "clinical data standards"
  ],
  "systems-biology": [
    "network analysis methods",
    "pathway enrichment",
    "gene regulatory networks",
    "metabolic modeling",
    "multi-scale modeling"
  ],
  "epigenetics": [
    "DNA methylation analysis",
    "histone modifications",
    "chromatin accessibility",
    "ATAC-seq analysis",
    "epigenetic clocks"
  ],
  "crispr-gene-editing": [
    "CRISPR-Cas9 applications",
    "base editing advances",
    "prime editing technology",
    "CRISPR screens",
    "off-target prediction"
  ],
  "ai-in-biology": [
    "deep learning for proteins",
    "large language models in biology",
    "generative AI for molecules",
    "computer vision in microscopy",
    "AI drug discovery"
  ],
  "databases-tools": [
    "NCBI resource updates",
    "UniProt new features",
    "Ensembl database changes",
    "new bioinformatics tools",
    "tool comparison guides"
  ],
  "industry-news": [
    "biotech funding trends",
    "pharma partnerships",
    "regulatory updates",
    "company acquisitions",
    "job market trends"
  ],
  "career-resources": [
    "bioinformatics career paths",
    "skill development",
    "interview preparation",
    "resume tips",
    "networking strategies"
  ],
  "research-highlights": [
    "breakthrough papers",
    "innovative methods",
    "high-impact discoveries",
    "research reproducibility",
    "open science initiatives"
  ]
};

/**
 * Generate a unique slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

/**
 * Get a random topic for a category
 */
function getRandomTopic(categorySlug: string): string {
  const topics = categoryTopics[categorySlug];
  if (!topics || topics.length === 0) {
    return `latest developments in ${categorySlug.replace(/-/g, " ")}`;
  }
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Generate blog content using OpenAI
 */
export async function generateBlogContent(
  topic: string,
  categoryName: string
): Promise<{
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
}> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
    // Generate placeholder content for testing
    return generatePlaceholderContent(topic, categoryName);
  }

  const prompt = `You are an expert bioinformatics writer. Write a comprehensive, educational blog post about "${topic}" for a ${categoryName} category.

Requirements:
1. Create an engaging, SEO-optimized title (50-70 characters)
2. Write a compelling excerpt/summary (150-200 characters)
3. Write the main content (500-1500 words) with:
   - Introduction explaining the topic's importance
   - 3-5 main sections with clear headings (use ## for headings)
   - Practical examples or code snippets where relevant
   - Conclusion with key takeaways
4. Use proper Markdown formatting
5. Include relevant technical terminology
6. Make it accessible to both beginners and experts

Return your response in this exact JSON format:
{
  "title": "Your engaging title here",
  "excerpt": "Brief compelling summary",
  "content": "Full markdown content with ## headings",
  "metaTitle": "SEO title (50-60 chars)",
  "metaDesc": "SEO description (150-160 chars)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a bioinformatics expert and technical writer. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = response.choices[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: parsed.title || `Guide to ${topic}`,
      excerpt: parsed.excerpt || `Learn about ${topic} in bioinformatics`,
      content: parsed.content || `<p>Content about ${topic}</p>`,
      metaTitle: parsed.metaTitle || parsed.title?.substring(0, 60),
      metaDesc: parsed.metaDesc || parsed.excerpt?.substring(0, 160)
    };
  } catch (error) {
    console.error("OpenAI generation error:", error);
    return generatePlaceholderContent(topic, categoryName);
  }
}

/**
 * Generate placeholder content when API is unavailable
 */
function generatePlaceholderContent(topic: string, categoryName: string) {
  const title = `Complete Guide to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  return {
    title,
    excerpt: `Explore ${topic} in ${categoryName}. Learn best practices, tools, and techniques used by professionals.`,
    content: `<h2>Introduction to ${topic}</h2>
<p>In the rapidly evolving field of bioinformatics, ${topic} has become an essential skill for researchers and practitioners. This guide provides a comprehensive overview of the key concepts, tools, and best practices.</p>

<h2>Why ${topic} Matters</h2>
<p>Understanding ${topic} is crucial for modern biological research. It enables researchers to:</p>
<ul>
<li>Analyze complex biological datasets more effectively</li>
<li>Discover patterns and insights that would be impossible to find manually</li>
<li>Accelerate the pace of scientific discovery</li>
</ul>

<h2>Getting Started</h2>
<p>To begin working with ${topic}, you'll need to understand the fundamental concepts and have access to the right tools. Here's a step-by-step approach:</p>
<ol>
<li>Set up your computational environment</li>
<li>Learn the basic terminology and concepts</li>
<li>Practice with sample datasets</li>
<li>Apply your knowledge to real research questions</li>
</ol>

<h2>Best Practices</h2>
<p>When working with ${topic}, keep these best practices in mind:</p>
<ul>
<li>Always validate your results with independent methods</li>
<li>Document your workflow for reproducibility</li>
<li>Stay updated with the latest tools and methods</li>
<li>Collaborate with domain experts when needed</li>
</ul>

<h2>Conclusion</h2>
<p>Mastering ${topic} opens up new possibilities for biological research. By following the guidelines in this article, you'll be well-equipped to apply these techniques to your own research projects.</p>`,
    metaTitle: title.substring(0, 60),
    metaDesc: `Learn ${topic} for bioinformatics. Comprehensive guide covering tools, techniques, and best practices.`
  };
}

/**
 * Generate a blog post for a specific category
 */
export async function generatePostForCategory(categoryId: string): Promise<string | null> {
  try {
    // Get category details
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    // Get a topic for this category
    const topic = getRandomTopic(category.slug);

    // Generate content
    const content = await generateBlogContent(topic, category.name);

    // Generate unique slug
    let slug = generateSlug(content.title);
    const timestamp = Date.now().toString(36);
    slug = `${slug}-${timestamp}`;

    // Fetch media in parallel
    console.log(`📷 Fetching media for topic: ${topic}`);
    const [featuredImage, galleryImages, videoUrl] = await Promise.all([
      fetchUnsplashImage(topic),
      fetchUnsplashImages(topic, 4),
      fetchYouTubeVideo(topic)
    ]);

    // Use placeholders if API didn't return results
    const finalFeaturedImage = featuredImage || getPlaceholderImage(topic, 0);
    const finalGalleryImages = galleryImages.length > 0 
      ? galleryImages 
      : [
          getPlaceholderImage(topic, 1),
          getPlaceholderImage(topic, 2),
          getPlaceholderImage(topic, 3),
          getPlaceholderImage(topic, 4)
        ];
    const finalVideoUrl = videoUrl || getPlaceholderVideo();

    // Check if auto-publish is enabled
    const autoPublish = process.env.AUTOBLOG_AUTO_PUBLISH === "true";

    // Create the post with media
    const post = await prisma.post.create({
      data: {
        title: content.title,
        slug,
        excerpt: content.excerpt,
        content: content.content,
        image: finalFeaturedImage,
        images: JSON.stringify(finalGalleryImages),
        videoUrl: finalVideoUrl,
        metaTitle: content.metaTitle,
        metaDesc: content.metaDesc,
        categoryId: category.id,
        published: autoPublish,
        isAutoGenerated: true,
        generatedAt: new Date()
      }
    });

    console.log(`✅ Generated post: "${post.title}" for category: ${category.name}`);
    console.log(`   📷 Featured: ${finalFeaturedImage.substring(0, 50)}...`);
    console.log(`   🖼️ Gallery: ${finalGalleryImages.length} images`);
    console.log(`   🎬 Video: ${finalVideoUrl}`);
    return post.id;
  } catch (error) {
    console.error(`Failed to generate post for category ${categoryId}:`, error);
    return null;
  }
}

/**
 * Run the daily auto-blog generation
 * Generates one post per POST category
 */
export async function runDailyAutoBlog(): Promise<{
  success: number;
  failed: number;
  posts: string[];
}> {
  console.log("🚀 Starting daily auto-blog generation...");

  // Get all POST categories
  const categories = await prisma.category.findMany({
    where: { type: "POST" },
    select: { id: true, name: true, slug: true }
  });

  console.log(`Found ${categories.length} POST categories`);

  const results = {
    success: 0,
    failed: 0,
    posts: [] as string[]
  };

  // Generate one post per category
  for (const category of categories) {
    // Create a job record
    const job = await prisma.autoBlogJob.create({
      data: {
        categoryId: category.id,
        categoryName: category.name,
        topic: getRandomTopic(category.slug),
        status: "processing"
      }
    });

    try {
      const postId = await generatePostForCategory(category.id);
      
      if (postId) {
        // Update job as completed
        await prisma.autoBlogJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            postId,
            result: JSON.stringify({ postId })
          }
        });
        results.success++;
        results.posts.push(postId);
      } else {
        throw new Error("No post ID returned");
      }
    } catch (error: unknown) {
      // Update job as failed
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await prisma.autoBlogJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          error: errorMessage
        }
      });
      results.failed++;
    }

    // Add small delay between generations to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ Auto-blog complete: ${results.success} success, ${results.failed} failed`);
  return results;
}

/**
 * Get the status of auto-blog jobs
 */
export async function getAutoBlogStatus(): Promise<{
  lastRun: Date | null;
  pendingJobs: number;
  completedToday: number;
  failedToday: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingJobs, completedToday, failedToday, lastJob] = await Promise.all([
    prisma.autoBlogJob.count({ where: { status: "pending" } }),
    prisma.autoBlogJob.count({
      where: {
        status: "completed",
        createdAt: { gte: today }
      }
    }),
    prisma.autoBlogJob.count({
      where: {
        status: "failed",
        createdAt: { gte: today }
      }
    }),
    prisma.autoBlogJob.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    })
  ]);

  return {
    lastRun: lastJob?.createdAt || null,
    pendingJobs,
    completedToday,
    failedToday
  };
}
