import { PrismaClient } from "@prisma/client";
import { tools } from "./data/tools";
import { posts } from "./data/posts";
import { courses } from "./data/courses";

const prisma = new PrismaClient();

const categories = [
  "RNA-seq Analysis", "Variant Calling", "Single-cell Analysis", "Metagenomics",
  "Proteomics", "Structural Bioinformatics", "Multi-omics Integration", "Visualization",
  "Workflow Managers", "Cloud Platforms", "AI/ML in Bioinformatics", "Beginner Guides",
  "Genomics", "R/Bioconductor", "Python for Bio", "Careers"
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
        featured: tool.featured
      },
      create: {
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        content: tool.content,
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

  // 5. Create Resources (Filler)
  console.log("Seeding Resources...");
  for (let i = 1; i <= 10; i++) {
     const catId = categoryMap.get(categories[i % categories.length]);
     await prisma.resource.create({
       data: {
         title: `Essential Guide to ${categories[i % categories.length]}`,
         slug: `guide-${i}`,
         type: "Book",
         description: "A must-read book for every bioinformatician.",
         categoryId: catId
       }
     }).catch(() => {});
  }

  // 6. Create Admin User
  console.log("Seeding Admin...");
  await prisma.user.upsert({
    where: { email: "admin@biohub.io" },
    update: {},
    create: {
      email: "admin@biohub.io",
      name: "Admin User",
      role: "ADMIN"
    }
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
