/**
 * Sitemap Generator
 * 
 * Next.js App Router convention for dynamic sitemap generation
 * Generates a unified sitemap with all content from the database
 */

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bioinformaticshub.io";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Get categories
  const categories = await prisma.category.findMany({
    where: { type: "TOOL" },
    select: { slug: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/directory/${cat.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Get tools
  const tools = await prisma.tool.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, featured: true },
    orderBy: { updatedAt: "desc" },
  });

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/directory/tool/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "weekly" as const,
    priority: tool.featured ? 0.9 : 0.7,
  }));

  // Get posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const postPages: MetadataRoute.Sitemap = posts.map((post) => {
    const changeFreq: "daily" | "weekly" = post.createdAt > oneWeekAgo ? "daily" : "weekly";
    return {
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: changeFreq,
      priority: post.createdAt > oneWeekAgo ? 0.8 : 0.6,
    };
  });

  // Get courses
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...toolPages,
    ...postPages,
    ...coursePages,
  ];
}
