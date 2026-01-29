/**
 * Dynamic Sitemap Generator
 * 
 * Generates XML sitemaps from Elasticsearch/Database content:
 * - sitemap_index.xml (master index)
 * - sitemap_pages.xml (static pages)
 * - sitemap_tools.xml (bioinformatics tools)
 * - sitemap_posts.xml (blog posts)
 * - sitemap_courses.xml (courses)
 */

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo/config";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate XML sitemap from entries
 */
export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urlSet = entries
    .map((entry) => {
      let urlTag = `  <url>\n    <loc>${escapeXml(entry.url)}</loc>`;
      
      if (entry.lastmod) {
        urlTag += `\n    <lastmod>${entry.lastmod}</lastmod>`;
      }
      if (entry.changefreq) {
        urlTag += `\n    <changefreq>${entry.changefreq}</changefreq>`;
      }
      if (entry.priority !== undefined) {
        urlTag += `\n    <priority>${entry.priority.toFixed(1)}</priority>`;
      }
      
      urlTag += "\n  </url>";
      return urlTag;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlSet}
</urlset>`;
}

/**
 * Generate sitemap index XML
 */
export function generateSitemapIndexXml(sitemaps: { url: string; lastmod?: string }[]): string {
  const sitemapTags = sitemaps
    .map((sitemap) => {
      let tag = `  <sitemap>\n    <loc>${escapeXml(sitemap.url)}</loc>`;
      if (sitemap.lastmod) {
        tag += `\n    <lastmod>${sitemap.lastmod}</lastmod>`;
      }
      tag += "\n  </sitemap>";
      return tag;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapTags}
</sitemapindex>`;
}

/**
 * Get static pages sitemap entries
 */
export function getStaticPages(): SitemapEntry[] {
  return [
    { url: `${siteConfig.url}`, priority: 1.0, changefreq: "daily" },
    { url: `${siteConfig.url}/directory`, priority: 0.9, changefreq: "daily" },
    { url: `${siteConfig.url}/blog`, priority: 0.9, changefreq: "daily" },
    { url: `${siteConfig.url}/courses`, priority: 0.8, changefreq: "weekly" },
    { url: `${siteConfig.url}/compare`, priority: 0.8, changefreq: "weekly" },
    { url: `${siteConfig.url}/about`, priority: 0.5, changefreq: "monthly" },
    { url: `${siteConfig.url}/contact`, priority: 0.5, changefreq: "monthly" },
    { url: `${siteConfig.url}/pricing`, priority: 0.6, changefreq: "monthly" },
    { url: `${siteConfig.url}/privacy`, priority: 0.3, changefreq: "yearly" },
    { url: `${siteConfig.url}/terms`, priority: 0.3, changefreq: "yearly" },
  ];
}

/**
 * Get tools sitemap entries from database
 */
export async function getToolsSitemap(): Promise<SitemapEntry[]> {
  const tools = await prisma.tool.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
      featured: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return tools.map((tool) => ({
    url: `${siteConfig.url}/directory/tool/${tool.slug}`,
    lastmod: tool.updatedAt.toISOString().split("T")[0],
    changefreq: "weekly" as const,
    priority: tool.featured ? 0.9 : 0.7,
  }));
}

/**
 * Get categories sitemap entries
 */
export async function getCategoriesSitemap(): Promise<SitemapEntry[]> {
  const categories = await prisma.category.findMany({
    where: { type: "TOOL" },
    select: {
      slug: true,
    },
  });

  return categories.map((category) => ({
    url: `${siteConfig.url}/directory/${category.slug}`,
    changefreq: "weekly" as const,
    priority: 0.8,
  }));
}

/**
 * Get blog posts sitemap entries
 */
export async function getPostsSitemap(): Promise<SitemapEntry[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return posts.map((post) => {
    const isRecent = post.createdAt > oneWeekAgo;
    return {
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split("T")[0],
      changefreq: isRecent ? ("daily" as const) : ("weekly" as const),
      priority: isRecent ? 0.8 : 0.6,
    };
  });
}

/**
 * Get courses sitemap entries
 */
export async function getCoursesSitemap(): Promise<SitemapEntry[]> {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return courses.map((course) => ({
    url: `${siteConfig.url}/courses/${course.slug}`,
    lastmod: course.updatedAt.toISOString().split("T")[0],
    changefreq: "monthly" as const,
    priority: 0.7,
  }));
}

/**
 * Generate full sitemap data
 */
export async function generateFullSitemap(): Promise<{
  index: string;
  pages: string;
  tools: string;
  posts: string;
  courses: string;
  categories: string;
}> {
  const now = new Date().toISOString().split("T")[0];

  // Generate individual sitemaps
  const staticPages = getStaticPages();
  const tools = await getToolsSitemap();
  const posts = await getPostsSitemap();
  const courses = await getCoursesSitemap();
  const categories = await getCategoriesSitemap();

  // Combine categories with static pages
  const allStaticEntries = [...staticPages, ...categories];

  const sitemaps = {
    pages: generateSitemapXml(allStaticEntries),
    tools: generateSitemapXml(tools),
    posts: generateSitemapXml(posts),
    courses: generateSitemapXml(courses),
    categories: generateSitemapXml(categories),
  };

  // Generate sitemap index
  const index = generateSitemapIndexXml([
    { url: `${siteConfig.url}/sitemap_pages.xml`, lastmod: now },
    { url: `${siteConfig.url}/sitemap_tools.xml`, lastmod: now },
    { url: `${siteConfig.url}/sitemap_posts.xml`, lastmod: now },
    { url: `${siteConfig.url}/sitemap_courses.xml`, lastmod: now },
  ]);

  return {
    index,
    ...sitemaps,
  };
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
