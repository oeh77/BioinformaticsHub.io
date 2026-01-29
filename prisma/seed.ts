import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { tools } from "./data/tools";
import { posts } from "./data/posts";
import { courses } from "./data/courses";
import { resources } from "./data/resources";

const prisma = new PrismaClient();

// Default admin credentials - CHANGE THESE IN PRODUCTION!
const ADMIN_EMAIL = "admin@biohub.io";
const ADMIN_PASSWORD = "Admin@123!"; // Default password - user should change after first login
const ADMIN_NAME = "Admin User";

const categories = [
  "RNA-seq Analysis", "Variant Calling", "Single-cell Analysis", "Metagenomics",
  "Proteomics", "Structural Bioinformatics", "Multi-omics Integration", "Visualization",
  "Workflow Managers", "Cloud Platforms", "AI/ML in Bioinformatics", "AI in Biology", "Beginner Guides",
  "Genomics", "R/Bioconductor", "Python for Bio", "Careers"
];

// 25 POST categories for auto-blogging (10 tutorials + 15 general)
const postCategories = [
  // 10 Tutorial Categories
  { name: "Python for Bioinformatics", slug: "python-bioinformatics", description: "Tutorials on using Python for biological data analysis" },
  { name: "R for Biostatistics", slug: "r-biostatistics", description: "R programming tutorials for statistical analysis in biology" },
  { name: "NGS Data Analysis Tutorial", slug: "ngs-analysis", description: "Step-by-step guides for next-generation sequencing analysis" },
  { name: "Protein Structure Prediction", slug: "protein-structure-prediction", description: "Tutorials on computational protein structure modeling" },
  { name: "Machine Learning in Genomics", slug: "machine-learning-genomics", description: "ML/AI tutorials applied to genomic data" },
  { name: "Single-Cell RNA-Seq Analysis", slug: "single-cell-analysis-tutorial", description: "Comprehensive tutorials for scRNA-seq workflows" },
  { name: "Genome Assembly Tutorial", slug: "genome-assembly-tutorial", description: "Guides for de novo and reference-based assembly" },
  { name: "Variant Calling & Annotation", slug: "variant-calling-tutorial", description: "Tutorials on SNP/indel calling and annotation" },
  { name: "Phylogenetics & Evolution", slug: "phylogenetics-tutorial", description: "Tutorials on phylogenetic tree construction and analysis" },
  { name: "Metagenomics Analysis Tutorial", slug: "metagenomics-tutorial", description: "Guides for analyzing metagenomic sequencing data" },
  // 15 General Categories
  { name: "Genomics News", slug: "genomics-news", description: "Latest developments in genomics research" },
  { name: "Proteomics Insights", slug: "proteomics-insights", description: "Updates on proteomics methods and discoveries" },
  { name: "Transcriptomics", slug: "transcriptomics", description: "Gene expression and RNA analysis articles" },
  { name: "Metabolomics", slug: "metabolomics", description: "Metabolic profiling and pathway analysis" },
  { name: "Structural Biology", slug: "structural-biology", description: "3D structure determination and analysis" },
  { name: "Drug Discovery", slug: "drug-discovery", description: "Computational drug design and screening" },
  { name: "Clinical Bioinformatics", slug: "clinical-bioinformatics", description: "Bioinformatics in clinical settings" },
  { name: "Systems Biology", slug: "systems-biology", description: "Network and pathway modeling articles" },
  { name: "Epigenetics", slug: "epigenetics", description: "DNA methylation and chromatin modifications" },
  { name: "CRISPR & Gene Editing", slug: "crispr-gene-editing", description: "CRISPR technology and applications" },
  { name: "AI in Biology", slug: "ai-in-biology", description: "Artificial intelligence in life sciences" },
  { name: "Databases & Tools", slug: "databases-tools", description: "Bioinformatics database and tool reviews" },
  { name: "Industry News", slug: "industry-news", description: "Biotech and pharma industry updates" },
  { name: "Career & Resources", slug: "career-resources", description: "Career advice and learning resources" },
  { name: "Research Highlights", slug: "research-highlights", description: "Highlighted papers and discoveries" }
];

async function main() {
  console.log("Start seeding...");

  // 1. Create Categories
  console.log("Seeding Categories...");
  const categoryMap = new Map();
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const upserted = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: `Resources and tools related to ${name}`,
        type: "TOOL" 
      },
    });
    categoryMap.set(name, upserted.id);
  }

  // 1b. Create POST Categories (25 for auto-blogging)
  console.log("Seeding POST Categories (25 for auto-blogging)...");
  const postCategoryMap = new Map();
  for (const cat of postCategories) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: "POST"
      },
    });
    postCategoryMap.set(cat.slug, upserted.id);
  }
  console.log(`  Created ${postCategories.length} POST categories`);

  // 2. Create Rich Tools
  console.log("Seeding Rich Tools...");
  for (const tool of tools) {
    const catId = categoryMap.get(tool.category);
    if (!catId) continue;
    
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        description: tool.description,
        content: tool.content,
        featured: tool.featured,
        url: tool.url
      },
      create: {
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        content: tool.content,
        url: tool.url,
        pricing: tool.pricing,
        featured: tool.featured,
        categoryId: catId
      }
    });
  }

  // 2b. Create Filler Tools (Reduced count)
  console.log("Seeding Filler Tools...");
  for (let i = 1; i <= 20; i++) {
    const catKeys = Array.from(categoryMap.keys());
    const randomCat = catKeys[Math.floor(Math.random() * catKeys.length)];
    const catId = categoryMap.get(randomCat);
    
    await prisma.tool.create({
      data: {
        name: `BioTool-${i} (${randomCat})`,
        slug: `biotool-${i}`,
        description: `A powerful tool for ${randomCat} analysis with advanced features #${i}.`,
        content: `<p>This is a detailed description of BioTool-${i}. It is widely used for <strong>${randomCat}</strong>.</p>`,
        pricing: i % 3 === 0 ? "Paid" : "Free",
        featured: false,
        categoryId: catId
      }
    }).catch(() => {}); 
  }

  // 3. Create Rich Courses
  console.log("Seeding Rich Courses...");
  for (const course of courses) {
    const catId = categoryMap.get(course.category);
    if (!catId) continue;

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: {
        title: course.title,
        slug: course.slug,
        provider: course.provider,
        level: course.level,
        description: course.description,
        categoryId: catId
      }
    });
  }

  // 4. Create Rich Blog Posts
  console.log("Seeding Rich Blog Posts...");
  for (const post of posts) {
    const catId = categoryMap.get(post.category);
    if (!catId) continue;

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { content: post.content },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        published: post.published,
        categoryId: catId
      }
    });
  }

  // 5. Create Rich Resources
  console.log("Seeding Rich Resources...");
  for (const resource of resources) {
     const catId = categoryMap.get(resource.category);
     if (!catId) continue;

     await prisma.resource.upsert({
       where: { slug: resource.slug },
       update: {
         description: resource.description,
         url: resource.url
       },
       create: {
         title: resource.title,
         slug: resource.slug,
         type: resource.type,
         description: resource.description,
         url: resource.url,
         categoryId: catId
       }
     });
  }

  // 6. Create Admin User with password
  console.log("Seeding Admin User...");
  const hashedPassword = await hash(ADMIN_PASSWORD, 12);
  
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword, // Update password on re-seed
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  console.log("\n✅ Seeding finished!");
  console.log("\n📝 Admin Account Credentials:");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
